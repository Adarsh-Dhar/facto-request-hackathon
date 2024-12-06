import Image from "next/image";

const Footer = () => {
  return (
    <div className="flex justify-center">
      <div className="flex justify-between w-[50%] fixed bottom-6 align-center text-center content-center m-auto border-t-[1px] border-zinc-200 pt-8">
        <div className="flex">
          <Image src="logo.svg" alt="logo" width={100} height={100} />
        </div>
        <div className="flex gap-12 pt-2">
          <h3>Legal</h3>
          <h3>Brand Assets</h3>
          <h3>Join Us</h3>
        </div>
        <div className="pt-2">
          <h3 className="font-semibold text-zinc-500">© 2024 Maia</h3>
        </div>
      </div>
    </div>
  );
};

export default Footer;
