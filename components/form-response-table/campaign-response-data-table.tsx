"use client";

import {
  Answer,
  ApplicationStatus,
  Campaign,
  CampaignApplication,
  CampaignContribution,
  CampaignTier,
  CurrencyType,
  Form,
  FormResponse,
  Question,
  User,
} from "@prisma/client";
import DataTable from "./data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatAnswer } from "./utils";
import { useEffect, useState } from 'react';
import ResponseModal from '@/components/modal/view-response';
import { useRouter } from "next/navigation";
import { getApplicationStatusText, getCurrencySymbol } from "@/lib/utils";
import { PictureInPicture2 } from "lucide-react";


export default function CampaignApplicationsDataTable({
  campaign,
  applications,
}: {
  campaign: Campaign,
  applications: Array<CampaignApplication & { user: User | null } & { campaignTier: CampaignTier | null } & { formResponse: FormResponse & { answers: Array<Answer & { question: Question }> } | null } & { contribution: CampaignContribution | null }>
}) {
  const [data, setData] = useState<Row<any>[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row<any> | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function formatCampaignApplicationRows() {
      const formattedData = applications.map((application) => {
        const contribution = application.contribution?.amount && application.contribution?.amount > 0 
          ? getCurrencySymbol(campaign.currency) + application.contribution?.amount + " " + campaign.currency 
          : "";
        const row: { [key: string]: any } = {
          id: application.id,
          applicant: application.user?.email,
          tier: application.campaignTier?.name,
          contribution,
          status: application.status,
          currency: campaign.currency,
          tierData: application.campaignTier,
          formResponseData: application.formResponse
        };

        if (application.formResponse) {
          application.formResponse.answers.forEach((answer: Answer) => {
            row[answer.questionId] = answer;
          });
        }

        return row as Row<any>;
      });

      const nonNullFormattedData = formattedData.filter(row => row !== null) as Row<any>[];
      setData(nonNullFormattedData);      
    }

    formatCampaignApplicationRows();
  }, [applications, campaign]);

  const handleRowClick = (row: Row<any>) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const columns: ColumnDef<any, any>[] = [{
    header: "Applicant",
    accessorKey: "applicant",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {row.original.applicant}
        </div>
      );
    },
  }, {
    header: "Tier",
    accessorKey: "tier",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {row.original.tier}
        </div>
      );
    },
  }, {
    header: "Contribution",
    accessorKey: "contribution",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {row.original.contribution}
        </div>
      );
    },
  }, {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {getApplicationStatusText(row.original.status)}
        </div>
      );
    },
  }, {
    header: "",
    accessorKey: "expand",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <PictureInPicture2 
          className="cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }} 
          width={18} 
        />
      );
    },
  }];

  return (
    <div className="mt-4">
      {Object.keys(ApplicationStatus).map(status => {
        const statusData = data.filter((d: any) => d.status === status);

        if (statusData.length === 0) {
          return null; 
        }

        return (
          <div className="mt-4" key={status}>
            <div className="mb-2">{getApplicationStatusText(status as ApplicationStatus)} - {statusData.length}</div>
            <DataTable columns={columns} data={statusData} />
          </div>
        );
      })}
      <ResponseModal
        isOpen={isModalOpen}
        onClose={() => {setModalOpen(false); router.refresh()}}
        rowData={selectedRow ? selectedRow.original : null}
        formResponse={selectedRow ? selectedRow.original.formResponseData : null}
      />
    </div>
  );
}