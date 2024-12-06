"use client";

import ImageCard from "@/components/Card/Card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

function App() {
  const router = useRouter();
  return (
    <div className="w-[100%] h-[100%] mb-10">
      <div className="m-auto mt-10 bg-[url('/background.svg')] bg-cover bg-no-repeat bg-center w-[1200px] h-[500px]">
        <h1 className="items-center m-auto text-center pt-32 font-semibold text-4xl">Making financial transactions</h1>
        <h1 className="items-center m-auto text-center font-semibold text-4xl mt-2">shouldn&apos;t be that hard. </h1>
        <p className="pt-8 w-[75%] text-center m-auto text-lg text-zinc-500">
          Maia AI is an AI agent that solves the issue of onboarding users to make financial transactions using intents with the help of request
          network. Making blockchain transactions as easy as writing plain English.
        </p>
        <Button
          className="m-auto flex justify-center mt-8 bg-pink-600 w-[7.5rem] h-[2.8rem] hover:bg-pink-500"
          onClick={() => router.push("/intent")}
        >
          Explore Maia
        </Button>
      </div>
      <div className="m-auto justify-center flex flex-col w-[45%] mt-8">
        <div>
          <h1 className="text-3xl font-semibold text-center">How founders use Maia</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div>
            <ImageCard
              className="w-full text-lg text-center text-zinc-600"
              imageSrc="/request.png"
              heading="Requests"
              paragraph="Requests are the most important part of your project. They allow you to create the financial record on chain."
            />
          </div>
          <div>
            <ImageCard
              className="w-[full] text-lg text-center text-zinc-600"
              imageSrc="/pay.png"
              heading="Payments"
              paragraph="Payment can be made to the ongoing request or to a specific request that ends up fulfilling them."
            />
          </div>
          <div>
            <ImageCard
              className="w-[1270px] text-lg text-center text-zinc-600"
              imageSrc="/remind.png"
              heading="Reminders"
              paragraph="Remind people about the due payments. Our AI model only alerts people when the payment is due."
            />
          </div>
        </div>
      </div>
      <div className="mt-32 mb-16">
        <h1 className="m-auto text-center content-center mb-8 text-3xl font-semibold">Explore Maia AI</h1>
        <Card className={cn("m-auto", "w-[55%]")}>
          <CardContent>
            <Image
              src={"/assets/landingpagelogo.svg"}
              alt="project image"
              width={80}
              height={100}
              className="rounded-3xl p-4 mt-8 border-[1px] border-zinc-200 align-center text-center m-auto"
            />
          </CardContent>
          <CardFooter className="flex flex-col">
            <h1 className="text-left text-3xl font-medium">{"Check out our AI powered tools"}</h1>
            <h1 className="mt-4 text-lg text-zinc-600 w-[70%] text-center">
              {
                "We have a variety of tools to help you get started. From creating a request to making a request to reminding users about their payments. We have got you covered"
              }
            </h1>
          </CardFooter>
        </Card>
      </div>
      <div className="mt-32">
        <div className="flex justify-center">
          <div className="flex justify-between w-[50%] align-center text-center content-center m-auto border-t-[1px] border-zinc-200 pt-8">
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
      </div>
    </div>
  );
}

export default App;
