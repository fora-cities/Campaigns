import Image from "next/image";

export default function NotFoundCity() {
  return (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl dark:text-white">404</h1>
      <Image
        alt="missing organization"
        src="https://illustrations.popsy.co/gray/falling.svg"
        width={400}
        height={400}
        className="dark:hidden"
      />
      <Image
        alt="missing organization"
        src="https://illustrations.popsy.co/white/falling.svg"
        width={400}
        height={400}
        className="hidden dark:block"
      />
      <p className="text-lg text-gray-500 dark:text-gray-400">
        Organization does not exist, or you do not have permission to view it
      </p>
    </div>
  );
}
