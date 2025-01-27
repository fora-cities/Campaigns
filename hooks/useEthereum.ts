import { LogDescription, ethers } from "ethers";
import ERC20ABI from '@/protocol/campaigns/abi/ERC20.json';
import CampaignERC20V1ContractABI from '@/protocol/campaigns/abi/CampaignERC20V1.json';
import CampaignETHV1ContractABI from '@/protocol/campaigns/abi/CampaignETHV1.json';
import CampaignFactoryV1ContractABI from '@/protocol/campaigns/abi/CampaignFactoryV1.json';
import { toast } from "sonner";
import { ApplicationStatus, Campaign, CampaignApplication, CampaignContribution, CampaignTier, CurrencyType, FormResponse, User } from "@prisma/client";
import { CampaignWithData, createCampaignApplication, getUserOrWalletCampaignContribution, launchCampaign, respondToCampaignApplication, withdrawCampaignApplication } from "@/lib/actions";
import { useEffect, useState } from "react";
import { getCampaignFactoryV1ContractAddress, getChainName, getCurrencySymbol, getCurrencyTokenAddress, getCurrencyTokenDecimals, getRPCUrl, getSupportedChainIds } from "@/lib/utils";

interface LaunchCampaignData {
  id: string;
  sponsorEthAddress: string;
  deployedAddress: string;
  chainId: string;
  deployed: boolean;
}

interface LaunchParams {
  subdomain: string;
}

interface Log {
  topics: string[];
  data: string;
}

export default function useEthereum() {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
      } else {
        await connectToWallet();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const getProviderForChain = (chainId: string) => {
    const rpcUrl = getRPCUrl(chainId);
    return new ethers.JsonRpcProvider(rpcUrl);
  }

  const connectToWallet = async () => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask or another wallet.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const newSigner = await provider.getSigner();
    setSigner(newSigner);

    return newSigner;
  };

  const getChainId = async (campaign: Campaign) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    const supportedChainIds = getSupportedChainIds();

    if (!supportedChainIds.includes(network.chainId.toString())) {
      throw new Error(`Please switch to the ${getChainName(campaign.chainId)} network in your wallet.`);
    }

    return network.chainId;
  }

  const launch = async (campaign: Campaign, params: LaunchParams): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();

      const campaignABI = JSON.stringify(CampaignFactoryV1ContractABI);

      const creatorAddress = await currentSigner.getAddress();

      const chainId = await getChainId(campaign);

      if (!campaign.currency) {
        throw new Error("Campaign is missing currency setting");
      }

      if (!campaign.threshold) {
        throw new Error("Campaign is missing threshold setting");
      }

      if (!campaign.deadline) {
        throw new Error("Campaign is missing deadline setting");
      }

      if (campaign.deadline < new Date()) {
        throw new Error("Campaign deadline must be in the future");
      }
      
      const tokenAddress = getCurrencyTokenAddress(chainId, campaign.currency);
      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const threshold = ethers.parseUnits(campaign.threshold.toString(), tokenDecimals);
      const deadline = Math.floor(new Date(campaign.deadline).getTime() / 1000)

      toast('Launching campaign...', { duration: 60000 });

      const campaignFactoryV1ContractAddress = getCampaignFactoryV1ContractAddress(chainId);
      const campaignFactory = new ethers.Contract(campaignFactoryV1ContractAddress, campaignABI, currentSigner);
      
      let campaignAddress = "";

      if (campaign.currency === CurrencyType.ETH) {
        const transaction = await campaignFactory.createCampaignETH(
          creatorAddress,
          threshold,
          deadline
        );

        toast.dismiss();
        toast('Confirming transaction...', { duration: 60000 });

        const receipt = await transaction.wait();
        const events = receipt.logs.map((log: Log) => campaignFactory.interface.parseLog(log));
        const campaignCreatedEvent = events.find((log: LogDescription) => log && log.name === "CampaignETHCreated");
        campaignAddress = campaignCreatedEvent.args.campaignAddress;
      } else {
        const transaction = await campaignFactory.createCampaignERC20(
          creatorAddress,
          tokenAddress,
          threshold,
          deadline
        );

        toast.dismiss();
        toast('Confirming transaction...', { duration: 60000 });

        const receipt = await transaction.wait();
        const events = receipt.logs.map((log: Log) => campaignFactory.interface.parseLog(log));
        const campaignCreatedEvent = events.find((log: LogDescription) => log && log.name === "CampaignERC20Created");
        campaignAddress = campaignCreatedEvent.args.campaignAddress;
      }

      const data: LaunchCampaignData = {
        id: campaign.id,
        sponsorEthAddress: creatorAddress,
        deployedAddress: campaignAddress,
        chainId: chainId.toString(),
        deployed: true,
      };
      
      await launchCampaign(data, { params: { subdomain: params.subdomain } }, null);

      toast.dismiss();
      toast.success(`Campaign launched!`);
    } catch (error: any) {
      console.error(error);
      const friendlyError = parseEthersError(error);
      toast.dismiss();
      toast.error(friendlyError);
      throw new Error("There is a problem launching the campaign")
    }
  };

  const contribute = async (userId: string, amount: number, campaign: Campaign, campaignTier: CampaignTier, formResponse?: FormResponse): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();
      const currentSignerAddress = await currentSigner.getAddress();
      const chainId = await getChainId(campaign);

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      if (campaign.chainId && campaign.chainId !== chainId.toString()) {
        throw new Error(`This campaign is on a different network. Please switch to the ${getChainName(campaign.chainId)} network in your wallet.`);
      }

      const alreadyContributed = await getUserOrWalletCampaignContribution(campaign.id, userId, currentSignerAddress);
      if (alreadyContributed) {
        throw new Error("You have already contributed to this campaign with this email or wallet. You can only contribute to this campaign once.")
      }

      const tokenAddress = getCurrencyTokenAddress(chainId, campaign.currency);
      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const contributeAmount = ethers.parseUnits(amount.toString(), tokenDecimals);

      let events = [];
      let transactionHash = "";

      if (campaign.currency === CurrencyType.ETH) {
        toast('Sending contribution...', { duration: 60000 });

        const campaignABI = JSON.stringify(CampaignETHV1ContractABI);
        const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
        const transaction = await campaignInstance.submitContribution({
            value: contributeAmount
        });

        toast.dismiss();
        toast('Confirming transaction...', { duration: 60000 });
        
        const receipt = await transaction.wait();

        events = receipt.logs.map((log: Log) => campaignInstance.interface.parseLog(log));
        transactionHash = transaction.hash;
      } else {
        const tokenInstance = new ethers.Contract(tokenAddress, ERC20ABI, currentSigner);
        const allowance = await tokenInstance.allowance(currentSignerAddress, campaign.deployedAddress);

        if (allowance < contributeAmount) {
          toast('Approving token for contribution...', { duration: 60000 });
          
          const approveTx = await tokenInstance.approve(campaign.deployedAddress, contributeAmount);
          
          toast.dismiss();
          toast('Confirming transaction...', { duration: 60000 });

          await approveTx.wait();
        }

        toast.dismiss();
        toast('Sending contribution...', { duration: 60000 });

        const campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
        const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
        const transaction = await campaignInstance.submitContribution(contributeAmount);
        
        toast.dismiss()
        toast('Confirming transaction...', { duration: 60000 });

        const receipt = await transaction.wait();

        events = receipt.logs.map((log: Log) => campaignInstance.interface.parseLog(log));
        transactionHash = transaction.hash;
      }
      
      const contributionSubmittedEvent = events.find((log: LogDescription) => log && log.name === "ContributionSubmitted");
      const { actualSubmittedContribution } = contributionSubmittedEvent.args;
      const actualSubmittedContributionAmount = parseFloat(ethers.formatUnits(actualSubmittedContribution, tokenDecimals));

      await createCampaignApplication(chainId, campaign.id, campaignTier.id, actualSubmittedContributionAmount, formResponse?.id, transactionHash, currentSignerAddress);
      
      toast.dismiss();
      toast.success(`Contribution sent!`);
    } catch (error: any) {
      console.error(error);
      const friendlyError = parseEthersError(error);
      toast.dismiss();
      toast.error(friendlyError);
      throw error;
    }
  };

  const withdrawContribution = async (campaign: Campaign, application: CampaignApplication, contribution: CampaignContribution): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();
      const chainId = await getChainId(campaign);

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      if (campaign.chainId && campaign.chainId !== chainId.toString()) {
        throw new Error(`This campaign is on a different network. Please switch to the ${getChainName(campaign.chainId)} network in your wallet.`);
      }

      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const contributeAmount = ethers.parseUnits(contribution.amount.toString(), tokenDecimals);

      toast('Withdrawing contribution...', { duration: 60000 });

      let campaignABI = "";

      if (campaign.currency === CurrencyType.ETH) {
        campaignABI = JSON.stringify(CampaignETHV1ContractABI);
      } else {
        campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
      }

      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
      const transaction = await campaignInstance.withdrawContribution(contributeAmount);

      toast.dismiss();
      toast('Confirming transaction...', { duration: 60000 });
        
      const receipt = await transaction.wait();
      
      await withdrawCampaignApplication(application.id, transaction.hash);
      
      toast.dismiss();
      toast.success(`Contribution withdrawn!`);
    } catch (error: any) {
      console.error(error);
      const friendlyError = parseEthersError(error);
      toast.dismiss();
      toast.error(friendlyError);
    }
  };

  const rejectContribution = async (campaign: CampaignWithData, application: CampaignApplication & { user: User }, contributor: string, justRejected: boolean): Promise<boolean | void> => {
    try {
      const currentSigner = signer || await connectToWallet();
      const chainId = await getChainId(campaign);

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      if (campaign.chainId && campaign.chainId !== chainId.toString()) {
        throw new Error(`This campaign is on a different network. Please switch to the ${getChainName(campaign.chainId)} network in your wallet.`);
      }

      if (!contributor) {
        throw new Error("No contributor address available");
      }

      if (application.refundTransaction || justRejected) {
        console.log("Contributor rejected before. Skipping smart contract transaction.")
        await respondToCampaignApplication(application.user.email as string, campaign, application.id, ApplicationStatus.REJECTED);
        return true;
      }

      toast('Rejecting contribution...', { duration: 60000 });

      let campaignABI = "";

      if (campaign.currency === CurrencyType.ETH) {
        campaignABI = JSON.stringify(CampaignETHV1ContractABI);
      } else {
        campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
      }

      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
      const transaction = await campaignInstance.rejectContributions([contributor]);

      toast.dismiss();
      toast('Confirming transaction...', { duration: 60000 });
        
      const receipt = await transaction.wait();
      
      await respondToCampaignApplication(application.user.email as string, campaign, application.id, ApplicationStatus.REJECTED, transaction.hash);
      
      toast.dismiss();
      toast.success(`The user has been refunded. If the decline was in error or needs to be reversed, the user may resubmit using a different wallet.`);
      
      return true;
    } catch (error: any) {
      console.error(error);
      const friendlyError = parseEthersError(error);
      toast.dismiss();
      toast.error("Please check that the wallet is not already declined: " + friendlyError);
    }
  };

  const withdrawFromCampaign = async (amount: string, recipientAddress: string, campaign: Campaign): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();
      const chainId = await getChainId(campaign);

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      if (campaign.chainId && campaign.chainId !== chainId.toString()) {
        throw new Error(`This campaign is on a different network. Please switch to the ${getChainName(campaign.chainId)} network in your wallet.`);
      }

      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const withdrawAmount = ethers.parseUnits(amount, tokenDecimals);

      toast('Withdrawing...', { duration: 60000 });

      let campaignABI = "";

      if (campaign.currency === CurrencyType.ETH) {
        campaignABI = JSON.stringify(CampaignETHV1ContractABI);
      } else {
        campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
      }

      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
      const transaction = await campaignInstance.transferContributions(recipientAddress, withdrawAmount);

      toast.dismiss();
      toast('Confirming transaction...', { duration: 60000 });
        
      const receipt = await transaction.wait();
      
      toast.dismiss();
      toast.success(`Withdrew ${getCurrencySymbol(campaign.currency)}${amount} ${campaign.currency}`);
    } catch (error: any) {
      console.error(error);
      const friendlyError = parseEthersError(error);
      toast.dismiss();
      toast.error(friendlyError);
    }
  };

  const extendCampaignDeadline = async (campaign: Campaign, extendedDeadline: Date): Promise<boolean | void> => {
    try {
      const currentSigner = signer || await connectToWallet();
      const chainId = await getChainId(campaign);

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      if (campaign.chainId && campaign.chainId !== chainId.toString()) {
        throw new Error(`This campaign is on a different network. Please switch to the ${getChainName(campaign.chainId)} network in your wallet.`);
      }

      if (!extendedDeadline) {
        throw new Error("Campaign is missing deadline setting");
      }

      if (extendedDeadline < new Date()) {
        throw new Error("Campaign deadline must be in the future");
      }

      const newDeadline = Math.floor(new Date(extendedDeadline).getTime() / 1000);

      toast('Extending campaign deadline...', { duration: 60000 });

      let campaignABI = "";

      if (campaign.currency === CurrencyType.ETH) {
        campaignABI = JSON.stringify(CampaignETHV1ContractABI);
      } else {
        campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
      }

      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
      const transaction = await campaignInstance.extendContributionDeadline(newDeadline);

      toast.dismiss();
      toast('Confirming transaction...', { duration: 60000 });
        
      const receipt = await transaction.wait();
      
      toast.dismiss();
      toast.success(`Campaign deadline has been extended.`);

      return true;
    } catch (error: any) {
      console.error(error);
      const friendlyError = parseEthersError(error);
      toast.dismiss();
      toast.error(friendlyError);
      throw new Error("There is a problem extending the deadline")
    }
  };

  const isCampaignCompleted = async (campaign: Campaign) => {
    if (!campaign.chainId) {
      throw new Error("Campaign is not associated with a network. Pleased create a new campaign.");
    }

    const provider = getProviderForChain(campaign.chainId);

    let campaignABI = "";

    if (campaign.currency === CurrencyType.ETH) {
      campaignABI = JSON.stringify(CampaignETHV1ContractABI);
    } else {
      campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
    }

    const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, provider);
    const isCampaignCompleted = await campaignInstance.isCampaignCompleted();

    return isCampaignCompleted;
  }

  const isCampaignDeadlineExceeded = async (campaign: Campaign) => {
    if (!campaign.chainId) {
      throw new Error("Campaign is not associated with a network. Pleased create a new campaign.");
    }

    const provider = getProviderForChain(campaign.chainId);

    let campaignABI = "";

    if (campaign.currency === CurrencyType.ETH) {
      campaignABI = JSON.stringify(CampaignETHV1ContractABI);
    } else {
      campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
    }

    const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, provider);
    const isCampaignDeadlineExceeded = await campaignInstance.isContributionDeadlineExceeded();

    return isCampaignDeadlineExceeded;
  }

  const getContributionTotal = async (campaign: Campaign) => {
    if (!campaign.chainId) {
      throw new Error("Campaign is not associated with a network. Pleased create a new campaign.");
    }

    const provider = getProviderForChain(campaign.chainId);

    let campaignABI = "";

    if (campaign.currency === CurrencyType.ETH) {
      campaignABI = JSON.stringify(CampaignETHV1ContractABI);
    } else {
      campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
    }

    const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, provider);
    const totalContributions = await campaignInstance.totalContributions();

    const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
    const total = parseFloat(ethers.formatUnits(totalContributions, tokenDecimals));

    return total;
  }

  const getContributionTransferred = async (campaign: Campaign) => {
    if (!campaign.chainId) {
      throw new Error("Campaign is not associated with a network. Pleased create a new campaign.");
    }

    const provider = getProviderForChain(campaign.chainId);

    let campaignABI = "";

    if (campaign.currency === CurrencyType.ETH) {
      campaignABI = JSON.stringify(CampaignETHV1ContractABI);
    } else {
      campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
    }

    const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, provider);
    const contributionTransferred = await campaignInstance.contributionTransferred();

    const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
    const transferred = parseFloat(ethers.formatUnits(contributionTransferred, tokenDecimals));

    return transferred;
  }

  return {
    connectToWallet,
    launch,
    contribute,
    rejectContribution,
    withdrawContribution,
    withdrawFromCampaign,
    extendCampaignDeadline,
    getContributionTotal,
    getContributionTransferred,
    isCampaignCompleted,
    isCampaignDeadlineExceeded
  };
};

function parseEthersError(inputError: any) {
  let error = inputError;

  if (inputError.error && inputError.error.code && inputError.error.message) {
    error = inputError.error;
  }

  if (inputError.info && inputError.info.error && inputError.info.error.code && inputError.info.error.message) {
    error = inputError.info.error;

    if (error.data && error.data.code && error.data.message) {
      error = error.data;
    }
  }

  let userFriendlyMessage = error.message;

  if (error.code === 4001) {
      userFriendlyMessage = 'You have rejected the transaction request.';
  }
  else if (error.message && error.message.includes('insufficient funds')) {
      userFriendlyMessage = 'Insufficient funds.';
  }
  else if (error.message && error.message.includes('transfer amount exceeds balance')) {
    userFriendlyMessage = 'The transfer amount exceeds your balance.';
  }
  else if (error.message && error.message.includes('execution reverted')) {
      userFriendlyMessage = 'Transaction failed: the transaction was reverted by the EVM.';
  }
  else if (error.code === -32002) {
      userFriendlyMessage = 'Request already pending. Please check your wallet and approve or reject the previous request.';
  }
  else if (error.message && error.message.includes('contract target must be correctly configured')) {
      userFriendlyMessage = 'Please check that your wallet is on the correct network.';
  }
  else if (error.message && error.message.includes('invalid FixedNumber string value')) {
      userFriendlyMessage = 'The amount is invalid. Please check that the amount is not too small or too big.';
  }

  return userFriendlyMessage;
}