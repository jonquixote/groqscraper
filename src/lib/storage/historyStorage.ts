// src/lib/storage/historyStorage.ts
import { getCacheItem, setCacheItem } from '@/lib/cache/memoryCache';

// In a real implementation, this would use a database
// For now, we'll use the memory cache for simplicity
const HISTORY_CACHE_PREFIX = 'history:';
const HISTORY_LIST_KEY = 'history:list';

export interface ScrapingTask {
  id: string;
  userId?: string;
  url: string;
  instructions?: string;
  waitFor?: string;
  timestamp: string;
  results: any;
}

/**
 * Save a scraping task to history
 * @param task Scraping task to save
 * @returns Saved task with ID
 */
export async function saveScrapingTask(task: Omit<ScrapingTask, 'id'>): Promise<ScrapingTask> {
  // Generate a unique ID
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  
  // Create the task with ID
  const taskWithId: ScrapingTask = {
    ...task,
    id,
  };
  
  // Save the task
  setCacheItem(`${HISTORY_CACHE_PREFIX}${id}`, taskWithId, 30 * 24 * 60 * 60 * 1000); // 30 days
  
  // Update the list of tasks
  const taskList = getCacheItem(HISTORY_LIST_KEY) || [];
  taskList.unshift(id);
  setCacheItem(HISTORY_LIST_KEY, taskList, 30 * 24 * 60 * 60 * 1000); // 30 days
  
  return taskWithId;
}

/**
 * Get a scraping task by ID
 * @param id Task ID
 * @returns Scraping task or null
 */
export async function getScrapingTask(id: string): Promise<ScrapingTask | null> {
  return getCacheItem(`${HISTORY_CACHE_PREFIX}${id}`) || null;
}

/**
 * Get all scraping tasks
 * @param userId Optional user ID to filter by
 * @param limit Maximum number of tasks to return
 * @returns Array of scraping tasks
 */
export async function getAllScrapingTasks(userId?: string, limit = 100): Promise<ScrapingTask[]> {
  const taskList = getCacheItem(HISTORY_LIST_KEY) || [];
  const tasks: ScrapingTask[] = [];
  
  for (const id of taskList.slice(0, limit)) {
    const task = getCacheItem(`${HISTORY_CACHE_PREFIX}${id}`);
    if (task && (!userId || task.userId === userId)) {
      tasks.push(task);
    }
  }
  
  return tasks;
}

/**
 * Delete a scraping task
 * @param id Task ID
 * @returns Success status
 */
export async function deleteScrapingTask(id: string): Promise<boolean> {
  // Remove the task
  setCacheItem(`${HISTORY_CACHE_PREFIX}${id}`, null, 0);
  
  // Update the list of tasks
  const taskList = getCacheItem(HISTORY_LIST_KEY) || [];
  const newTaskList = taskList.filter((taskId: string) => taskId !== id);
  setCacheItem(HISTORY_LIST_KEY, newTaskList, 30 * 24 * 60 * 60 * 1000); // 30 days
  
  return true;
}
