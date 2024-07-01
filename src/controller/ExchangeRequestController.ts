import { Request, Response } from "express";
import { ExchangeRequestService } from "../services/exchangeRequest";
import { Prisma } from "@prisma/client";

const exchangeRequestService = new ExchangeRequestService();

export class ExchangeRequestController {
  async getAllExchangeRequests(req: Request, res: Response) {
    try {
      const requests = await exchangeRequestService.getAllExchangeRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getExchangeRequestById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const request = await exchangeRequestService.getExchangeRequestById(
        Number(id)
      );
      if (!request) {
        res.status(404).json({ message: "Exchange Request not found" });
      } else {
        res.json(request);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createExchangeRequest(req: Request, res: Response) {
    console.log("createExchangeRequest");

    const { fromUserId } = req.body;

    try {
      const newExchangeRequest =
        await exchangeRequestService.createExchangeRequest({
          fromUser: { connect: { studentId: fromUserId } },
        });
      res.status(201).json(newExchangeRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateExchangeRequest(req: Request, res: Response) {
    const { id } = req.params;
    const data: Prisma.ExchangeRequestUpdateInput = req.body;

    console.log(data);

    try {
      const updatedRequest = await exchangeRequestService.updateExchangeRequest(
        Number(id),
        data
      );
      res.json(updatedRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteExchangeRequest(req: Request, res: Response) {
    console.log("deleteExchangeRequest");
    const id = parseInt(req.params.id);

    try {
      const deletedRequest = await exchangeRequestService.deleteExchangeRequest(
        id
      );
      res.json(deletedRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
