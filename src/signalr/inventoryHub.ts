import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";
import type { StockUpdatedEvent, LowStockEvent } from "../types";

const HUB_URL = (import.meta.env.VITE_SIGNALR_URL ?? "http://localhost:5000") + "/inventoryHub";

type StockUpdatedCallback = (event: StockUpdatedEvent) => void;
type LowStockCallback = (event: LowStockEvent) => void;

class InventoryHubService {
  private connection: signalR.HubConnection | null = null;
  private stockUpdatedCallbacks: StockUpdatedCallback[] = [];
  private lowStockCallbacks: LowStockCallback[] = [];

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("auth_token") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on("StockUpdated", (event: StockUpdatedEvent) => {
      toast.success(
        `${event.productName} stock updated\nRemaining Quantity: ${event.newQuantity}`,
        { duration: 4000 }
      );
      this.stockUpdatedCallbacks.forEach((cb) => cb(event));
    });

    this.connection.on("LowStock", (event: LowStockEvent) => {
      toast.error(
        `⚠ Low Stock Alert: ${event.productName}\nOnly ${event.currentQuantity} units left in ${event.warehouseName}`,
        { duration: 6000 }
      );
      this.lowStockCallbacks.forEach((cb) => cb(event));
    });

    this.connection.onreconnecting(() => {
      toast("Reconnecting to real-time service...", { icon: "🔄" });
    });

    this.connection.onreconnected(() => {
      toast.success("Real-time connection restored");
    });

    try {
      await this.connection.start();
    } catch {
      console.warn("SignalR connection failed. Real-time updates unavailable.");
    }
  }

  async stop(): Promise<void> {
    await this.connection?.stop();
    this.connection = null;
  }

  onStockUpdated(cb: StockUpdatedCallback): () => void {
    this.stockUpdatedCallbacks.push(cb);
    return () => {
      this.stockUpdatedCallbacks = this.stockUpdatedCallbacks.filter((f) => f !== cb);
    };
  }

  onLowStock(cb: LowStockCallback): () => void {
    this.lowStockCallbacks.push(cb);
    return () => {
      this.lowStockCallbacks = this.lowStockCallbacks.filter((f) => f !== cb);
    };
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const inventoryHub = new InventoryHubService();
