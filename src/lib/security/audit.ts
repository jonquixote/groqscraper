// src/lib/security/audit.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';

/**
 * Interface for audit log entry
 */
interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  action: string;
  details: any;
  ip?: string;
  userAgent?: string;
}

// In-memory store for audit logs (would be a database in production)
const auditLogs: AuditLogEntry[] = [];

/**
 * Log an action to the audit log
 * @param request Next.js request
 * @param action Action being performed
 * @param details Details of the action
 * @returns Audit log entry
 */
export async function logAction(
  request: NextRequest,
  action: string,
  details: any
): Promise<AuditLogEntry> {
  try {
    // Get the current user
    const user = await getCurrentUser(request);
    
    // Create the audit log entry
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      action,
      details,
      ip: request.ip,
      userAgent: request.headers.get('user-agent') || undefined,
    };
    
    // Add to the audit log
    auditLogs.push(entry);
    
    // In a real implementation, this would be saved to a database
    console.log('Audit log entry:', entry);
    
    return entry;
  } catch (error) {
    console.error('Error logging action:', error);
    
    // Create a minimal audit log entry in case of error
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action,
      details: {
        error: (error as Error).message,
        originalDetails: details,
      },
    };
    
    auditLogs.push(entry);
    
    return entry;
  }
}

/**
 * Get audit logs
 * @param userId Optional user ID to filter by
 * @param limit Maximum number of logs to return
 * @returns Array of audit log entries
 */
export function getAuditLogs(userId?: string, limit = 100): AuditLogEntry[] {
  // Filter by user ID if provided
  const filteredLogs = userId
    ? auditLogs.filter(log => log.userId === userId)
    : auditLogs;
  
  // Return the most recent logs up to the limit
  return filteredLogs.slice(-limit).reverse();
}
