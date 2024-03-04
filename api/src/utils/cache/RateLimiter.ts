import { config } from "../..";

interface RequestRecord {
    ipAddress: string;
    timestamp: number;
}

export class RateLimiter {
    private requestHistory: RequestRecord[] = []; // Array to store timestamps of recent requests
    private windowSize: number; // Time window for rate calculation in milliseconds
    private thresholdMultiplier: number; // Multiplier for standard deviation
    private meanRequestRate: number = 0; // Mean request rate calculated over the time window
    private standardDeviation: number = 0; // Standard deviation of request rate
    private clearInterval: number; // Time interval to clear the request history for each IP

    constructor() {
        this.windowSize = config.security.ratelimit.windowExpire;
        this.thresholdMultiplier = config.security.ratelimit.thresholdMultiplier;
        this.clearInterval = config.security.ratelimit.clearInterval;
    }

    // Method to check if a new request can be allowed
    public allowRequest(ipAddress: string): boolean {
        this.cleanupExpiredRecords(); // Remove expired records from the request history

        const currentTime = Date.now();
        const requestsForIP = this.requestHistory.filter(record => record.ipAddress === ipAddress);

        // Calculate current request rate for the IP
        let requestRate = this.calculateRequestRate(requestsForIP, currentTime);

        // Update mean and standard deviation if enough data points are available
        if (requestsForIP.length > 1) {
            this.meanRequestRate = this.calculateMean(requestRate);
            this.standardDeviation = this.calculateStandardDeviation(requestRate);
        }

        // Calculate the threshold based on mean and standard deviation
        const threshold = this.meanRequestRate + this.thresholdMultiplier * this.standardDeviation;
        
        // If no requests, it produced NaN
        if (!requestRate) requestRate = 0;

        // If the current request rate is below the threshold, allow the request
        if (requestRate <= threshold) {
            this.requestHistory.push({ ipAddress, timestamp: currentTime }); // Add current record to request history
            return true;
        } else {
            this.requestHistory.push({ ipAddress, timestamp: currentTime });
            return false; // Otherwise, deny the request
        }
    }

    // Method to remove expired records from the request history
    private cleanupExpiredRecords() {
        const currentTime = Date.now();
        const cutoffTime = currentTime - this.clearInterval;
        this.requestHistory = this.requestHistory.filter(record => record.timestamp > cutoffTime);
    }

    // Method to calculate the current request rate for a given IP
    private calculateRequestRate(requestsForIP: RequestRecord[], currentTime: number): number {
        const windowStart = currentTime - this.windowSize; // Calculate the start of the time window
        const requestsInWindow = requestsForIP.filter(record => record.timestamp >= windowStart && record.timestamp <= currentTime); // Filter records within the window
        return requestsInWindow.length / (this.windowSize / 1000); // Calculate request rate (requests per second)
    }

    // Method to calculate the mean request rate
    private calculateMean(requestRate: number): number {
        const sum = this.requestHistory.reduce((acc, curr) => acc + curr.timestamp, 0); // Sum of all timestamps
        return sum / this.requestHistory.length; // Mean request rate
    }

    // Method to calculate the standard deviation of request rate
    private calculateStandardDeviation(requestRate: number): number {
        const squaredDifferences = this.requestHistory.map(record => (record.timestamp - requestRate) ** 2); // Squared differences from the mean
        const variance = squaredDifferences.reduce((acc, curr) => acc + curr, 0) / this.requestHistory.length; // Variance
        return Math.sqrt(variance); // Standard deviation
    }
}