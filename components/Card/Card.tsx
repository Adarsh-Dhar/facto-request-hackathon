import * as React from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ImageCard(props: { imageSrc: string; heading: string; paragraph: string; className: string }) {
  return (
    <Card className={cn("w-full", props.className)}>
      <CardContent>
        <Image src={props.imageSrc} alt="project image" width={350} height={200} className="rounded-3xl align-center text-center m-auto" />
      </CardContent>
      <CardFooter className="flex flex-col">
        <h1 className="text-left text-lg font-medium">{props.heading}</h1>
        <h1>{props.paragraph}</h1>
      </CardFooter>
    </Card>
  );
}
