import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, userAddresses, categories, restaurants, menuItems, orders, drivers, specialOffers,
  adminUsers, adminSessions, uiSettings,
  type User, type InsertUser,
  type UserAddress, type InsertUserAddress,
  type Category, type InsertCategory,
  type Restaurant, type InsertRestaurant,
  type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder,
  type Driver, type InsertDriver,
  type SpecialOffer, type InsertSpecialOffer,
  type AdminUser, type InsertAdminUser,
  type AdminSession, type InsertAdminSession,
  type UiSettings, type InsertUiSettings
} from "@shared/schema";
import { IStorage } from "./storage";
import { eq, and, or, like, desc } from "drizzle-orm";

// Database connection with SSL support
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be defined in environment variables");
    }
    
    // Configure PostgreSQL connection with SSL
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    db = drizzle(sql);
    console.log("✅ Database connection established");
  }
  return db;
}

export class DatabaseStorage implements IStorage {
  private get db() {
    return getDb();
  }

  // Admin Authentication
  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    try {
      const [newAdmin] = await this.db.insert(adminUsers).values(adminUser).returning();
      return newAdmin;
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    try {
      const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.email, email));
      return admin;
    } catch (error) {
      console.error("Error getting admin by email:", error);
      return undefined;
    }
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    try {
      const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.email, username));
      return admin;
    } catch (error) {
      console.error("Error getting admin by username:", error);
      return undefined;
    }
  }

  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    try {
      const [newSession] = await this.db.insert(adminSessions).values(session).returning();
      return newSession;
    } catch (error) {
      console.error("Error creating admin session:", error);
      throw error;
    }
  }

  async getAdminSession(token: string): Promise<AdminSession | undefined> {
    try {
      const [session] = await this.db.select().from(adminSessions).where(eq(adminSessions.token, token));
      return session;
    } catch (error) {
      console.error("Error getting admin session:", error);
      return undefined;
    }
  }

  async deleteAdminSession(token: string): Promise<boolean> {
    try {
      const result = await this.db.delete(adminSessions).where(eq(adminSessions.token, token));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting admin session:", error);
      return false;
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await this.db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await this.db.select().from(categories).orderBy(categories.name);
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [newCategory] = await this.db.insert(categories).values(category).returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const [updated] = await this.db.update(categories).set(category).where(eq(categories.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Error updating category:", error);
      return undefined;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(categories).where(eq(categories.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }

  // Restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      return await this.db.select().from(restaurants).orderBy(restaurants.name);
    } catch (error) {
      console.error("Error getting restaurants:", error);
      return [];
    }
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    try {
      const [restaurant] = await this.db.select().from(restaurants).where(eq(restaurants.id, id));
      return restaurant;
    } catch (error) {
      console.error("Error getting restaurant:", error);
      return undefined;
    }
  }

  async getRestaurantsByCategory(categoryId: string): Promise<Restaurant[]> {
    try {
      return await this.db.select().from(restaurants).where(eq(restaurants.categoryId, categoryId));
    } catch (error) {
      console.error("Error getting restaurants by category:", error);
      return [];
    }
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    try {
      const [newRestaurant] = await this.db.insert(restaurants).values(restaurant).returning();
      return newRestaurant;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  }

  async updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    try {
      const [updated] = await this.db.update(restaurants).set(restaurant).where(eq(restaurants.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Error updating restaurant:", error);
      return undefined;
    }
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(restaurants).where(eq(restaurants.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      return false;
    }
  }

  // Menu Items
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      return await this.db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
    } catch (error) {
      console.error("Error getting menu items:", error);
      return [];
    }
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    try {
      const [item] = await this.db.select().from(menuItems).where(eq(menuItems.id, id));
      return item;
    } catch (error) {
      console.error("Error getting menu item:", error);
      return undefined;
    }
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    try {
      const [newItem] = await this.db.insert(menuItems).values(menuItem).returning();
      return newItem;
    } catch (error) {
      console.error("Error creating menu item:", error);
      throw error;
    }
  }

  async updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const [updated] = await this.db.update(menuItems).set(menuItem).where(eq(menuItems.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Error updating menu item:", error);
      return undefined;
    }
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(menuItems).where(eq(menuItems.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      return await this.db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    try {
      const [order] = await this.db.select().from(orders).where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error("Error getting order:", error);
      return undefined;
    }
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    try {
      return await this.db.select().from(orders).where(eq(orders.restaurantId, restaurantId));
    } catch (error) {
      console.error("Error getting orders by restaurant:", error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const [newOrder] = await this.db.insert(orders).values(order).returning();
      return newOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    try {
      const [updated] = await this.db.update(orders).set(order).where(eq(orders.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Error updating order:", error);
      return undefined;
    }
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    try {
      return await this.db.select().from(drivers).orderBy(drivers.name);
    } catch (error) {
      console.error("Error getting drivers:", error);
      return [];
    }
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    try {
      const [driver] = await this.db.select().from(drivers).where(eq(drivers.id, id));
      return driver;
    } catch (error) {
      console.error("Error getting driver:", error);
      return undefined;
    }
  }

  async getDriverByPhone(phone: string): Promise<Driver | undefined> {
    try {
      const [driver] = await this.db.select().from(drivers).where(eq(drivers.phone, phone));
      return driver;
    } catch (error) {
      console.error("Error getting driver by phone:", error);
      return undefined;
    }
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      return await this.db.select().from(drivers).where(and(eq(drivers.isAvailable, true), eq(drivers.isActive, true)));
    } catch (error) {
      console.error("Error getting available drivers:", error);
      return [];
    }
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    try {
      const [newDriver] = await this.db.insert(drivers).values(driver).returning();
      return newDriver;
    } catch (error) {
      console.error("Error creating driver:", error);
      throw error;
    }
  }

  async updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    try {
      const [updated] = await this.db.update(drivers).set(driver).where(eq(drivers.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Error updating driver:", error);
      return undefined;
    }
  }

  async deleteDriver(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(drivers).where(eq(drivers.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting driver:", error);
      return false;
    }
  }

  // Special Offers
  async getSpecialOffers(): Promise<SpecialOffer[]> {
    try {
      return await this.db.select().from(specialOffers).orderBy(desc(specialOffers.createdAt));
    } catch (error) {
      console.error("Error getting special offers:", error);
      return [];
    }
  }

  async getActiveSpecialOffers(): Promise<SpecialOffer[]> {
    try {
      return await this.db.select().from(specialOffers).where(eq(specialOffers.isActive, true));
    } catch (error) {
      console.error("Error getting active special offers:", error);
      return [];
    }
  }

  async createSpecialOffer(offer: InsertSpecialOffer): Promise<SpecialOffer> {
    try {
      const [newOffer] = await this.db.insert(specialOffers).values(offer).returning();
      return newOffer;
    } catch (error) {
      console.error("Error creating special offer:", error);
      throw error;
    }
  }

  async updateSpecialOffer(id: string, offer: Partial<InsertSpecialOffer>): Promise<SpecialOffer | undefined> {
    try {
      const [updated] = await this.db.update(specialOffers).set(offer).where(eq(specialOffers.id, id)).returning();
      return updated;
    } catch (error) {
      console.error("Error updating special offer:", error);
      return undefined;
    }
  }

  async deleteSpecialOffer(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(specialOffers).where(eq(specialOffers.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting special offer:", error);
      return false;
    }
  }

  // UI Settings
  async getUiSettings(): Promise<UiSettings[]> {
    try {
      return await this.db.select().from(uiSettings);
    } catch (error) {
      console.error("Error getting UI settings:", error);
      return [];
    }
  }

  async getUiSetting(key: string): Promise<UiSettings | undefined> {
    try {
      const [setting] = await this.db.select().from(uiSettings).where(eq(uiSettings.key, key));
      return setting;
    } catch (error) {
      console.error("Error getting UI setting:", error);
      return undefined;
    }
  }

  async updateUiSetting(key: string, value: string): Promise<UiSettings | undefined> {
    try {
      const [updated] = await this.db.update(uiSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(uiSettings.key, key))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating UI setting:", error);
      return undefined;
    }
  }

  async createUiSetting(setting: InsertUiSettings): Promise<UiSettings> {
    try {
      const [newSetting] = await this.db.insert(uiSettings).values(setting).returning();
      return newSetting;
    } catch (error) {
      console.error("Error creating UI setting:", error);
      throw error;
    }
  }

  async deleteUiSetting(key: string): Promise<boolean> {
    try {
      const result = await this.db.delete(uiSettings).where(eq(uiSettings.key, key));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting UI setting:", error);
      return false;
    }
  }
}

export const dbStorage = new DatabaseStorage();

// Test database connection
export async function testDatabaseConnection() {
  try {
    const db = getDb();
    await db.select().from(categories).limit(1);
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}