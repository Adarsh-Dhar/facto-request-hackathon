"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "./page";
import { ethers } from "ethers";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-left">Request ID</div>,
    cell: ({ row }) => {
      const id: string = row.getValue("id");

      return <div className="text-left font-medium">{id.substring(0, 7) + "..." + id.slice(-7)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => {
      const status: string = row.getValue("status");

      return <div className="text-left font-medium">{status}</div>;
    },
  },
  {
    accessorKey: "payer",
    header: () => <div className="text-center">Payer/Payee</div>,
    cell: ({ row }) => {
      const payer: string = row.getValue("payer");

      return <div className="text-center font-medium">{payer.substring(0, 7) + "..." + payer.slice(-7)}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-center">Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amount").toString();
      const currency = row.getValue("currency");

      return <div className="text-center font-medium">{ethers.utils.formatUnits(amount, currency === "FAU-sepolia" ? 18 : 6).toString()}</div>;
    },
  },
  {
    accessorKey: "currency",
    header: () => <div className="text-center">Currency</div>,
    cell: ({ row }) => {
      const currency: string = row.getValue("currency");

      return <div className="text-center font-medium">{currency}</div>;
    },
  },
  {
    accessorKey: "reason",
    header: () => <div className="text-center">Reason</div>,
    cell: ({ row }) => {
      const reason: string = row.getValue("reason");

      return <div className="text-center font-medium">{reason}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: () => <div className="text-right">Due Date</div>,
    cell: ({ row }) => {
      const dueDate: string = row.getValue("dueDate");

      return <div className="text-right font-medium">{dueDate}</div>;
    },
  },
];
