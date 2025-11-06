import { PrismaClient } from '@prisma/client';

/**
 * Prisma database client class with singleton pattern
 */
export class PrismaDatabase {
  private static instance: PrismaDatabase;
  private prismaClient: PrismaClient;
  private isConnected: boolean = false;

  private constructor() {
    this.prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): PrismaDatabase {
    if (!PrismaDatabase.instance) {
      PrismaDatabase.instance = new PrismaDatabase();
    }
    return PrismaDatabase.instance;
  }

  /**
   * Get the PrismaClient instance
   */
  getClient(): PrismaClient {
    return this.prismaClient;
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.prismaClient.$connect();
      this.isConnected = true;
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.prismaClient.$disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Check if the client is connected
   */
  connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const prismaDb = PrismaDatabase.getInstance();

// Export prisma client for backward compatibility
export const prisma = prismaDb.getClient();

// Export disconnect function for backward compatibility
export async function disconnectDb() {
  await prismaDb.disconnect();
}
