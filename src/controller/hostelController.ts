import { Request, Response } from "express";
import { HostelPaths } from "../types/index";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export class HostelController {
  async getAllHostels(
    req: Request<{}, {}, {}, HostelPaths["ListRequest"]>,
    res: Response<HostelPaths["ListResponse"]>
  ) {
    try {
      const { location, gender, year, limit, start } = req.query;

      const filterOptions: any = {};
      if (location) filterOptions.location = location;
      if (gender) filterOptions.genderType = gender;
      if (year) filterOptions.year = year;

      const paginationOptions = {
        skip: start ? Number(start) : undefined,
        take: limit ? Number(limit) : undefined,
      };

      const hostels = await prisma.hostel.findMany({
        where: filterOptions,
        ...paginationOptions,
        include: {
          rooms: {
            include: {
              _count: {
                select: { students: true },
              },
              students: {
                include: {
                  exchangeRequestsToUser: true,
                  exchangeRequestsFromUser: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(hostels);
    } catch (error) {
      console.error("Error retrieving hostels:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getHostelById(
    req: Request<{ id: string }>,
    res: Response<HostelPaths["GetByIdResponse"]>
  ) {
    const id = parseInt(req.params.id);
    console.log(typeof id);
    try {
      const hostel = await prisma.hostel.findUnique({
        where: { id: id },
        include: {
          rooms: {
            where: {
              students: {
                some: {
                  exchangeRequestsFromUser: {
                    some: {
                      status: "PENDING",
                    },
                  },
                },
              },
            },
            include: {
              students: {
                include: {
                  exchangeRequestsFromUser: true,
                },
              },
            },
          },
        },
      });

      if (!hostel) {
        res.status(404).json({ error: "Hostel not found" });
      } else {
        res.json(hostel);
      }
    } catch (error) {
      console.error("Error retrieving hostel:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createHostel(
    req: Request<{}, {}, HostelPaths["CreateRequest"]>,
    res: Response<HostelPaths["CreateResponse"]>
  ) {
    let { name, genderType, distance, location, year, rooms, variant } =
      req.body;

    distance = parseFloat(distance as unknown as string);

    try {
      const newHostel = await prisma.hostel.create({
        data: {
          variant,
          name,
          genderType,
          distance,
          location,
          year,
          rooms: {
            create: rooms.map((room) => ({
              capacity: room.capacity,
              beds: room.beds,
            })),
          },
        },
      });
      res.status(201).json(newHostel);
    } catch (error) {
      if (error.code === "P2002") {
        console.error(
          "Unique constraint violation: A hostel with this name already exists."
        );
        res
          .status(400)
          .json({ error: "A hostel with this name already exists." });
      } else {
        console.error("Error creating hostel:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  async updateHostel(
    req: Request<{ id: string }, {}, HostelPaths["UpdateRequest"]>,
    res: Response<HostelPaths["UpdateResponse"]>
  ) {
    let id = parseInt(req.params.id);
    const { name, genderType, distance, location, year } = req.body;
    try {
      const updatedHostel = await prisma.hostel.update({
        where: { id },
        data: {
          name,
          genderType,
          distance,
          location,
          year,
        },
      });
      res.json(updatedHostel);
    } catch (error) {
      console.error("Error updating hostel:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deleteHostel(
    req: Request<{ id: string }>,
    res: Response<HostelPaths["DeleteResponse"]>
  ) {
    const id = parseInt(req.params.id);
    try {
      await prisma.hostel.delete({
        where: { id },
      });
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting hostel:", error);

      if (error.code === "P2025") {
        res.status(404).json({ error: "Hostel not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
}

export default new HostelController();
