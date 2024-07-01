import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export class RoomService {

  async getAllRooms(id: number) {
    return prisma.room.findMany({
      where: {
        hostelId: id,
      },
    });
  }

  async getRoomById(roomId: number, hostelId: number) {
    const quary: Prisma.RoomFindUniqueArgs = {
      where: {
        hostelId: hostelId,
        id: roomId,
      },
    };
    return prisma.room.findUnique(quary);
  }

  async createRoom(data: Prisma.RoomCreateManyInput[]) {
    await prisma.room.createMany({
      data: data,
    });

    const rooms = await prisma.hostel.findUnique({
      where: {
        id: data[0].hostelId,
      },
      include: {
        rooms: true,
      },
    });

    return rooms;
  }

  async updateRoom(
    roomId: number,
    hostelId: number,
    data: Prisma.RoomUpdateInput
  ) {
    return prisma.room.update({
      where: { id: roomId, hostelId: hostelId },
      data,
    });
  }

  async deleteRoom(roomId: number, hostelId: number) {
    return prisma.room.delete({ where: { id: roomId, hostelId: hostelId } });
  }
    async getAllRooms(id: number) {
        return prisma.room.findMany({
            where: {
                hostelId: id
            }
        });
    }

    async getRoomById(roomId: number, hostelId: number) {
        const quary: Prisma.RoomFindUniqueArgs = {
            where: {
                hostelId: hostelId,
                id: roomId
            }
        }
        return prisma.room.findUnique(quary);
    }

    async createRoom(data: Prisma.RoomCreateManyInput) {
        return prisma.room.createMany({
            data: data
        });
    }

    async updateRoom(roomId: number, hostelId: number, data: Prisma.RoomUpdateInput) {
        return prisma.room.update({ where: { id: roomId, hostelId: hostelId }, data });
    }

    async deleteRoom(roomId: number, hostelId: number) {
        return prisma.room.delete({ where: { id: roomId, hostelId: hostelId } });
    }

    async connectUserToRoom(userId: number, roomId: number) {
        try {
            const student = await prisma.student.findUnique({
                where: { userId },
            });
        
            if (!student) {
                throw new Error(`No student found with userId: ${userId}`);
            }
        
            const updatedStudent = await prisma.student.update({
                where: { userId },
                data: { roomId },
            });
        
            return updatedStudent;
        } catch (error) {
            console.error('Error connecting user to room:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
}
