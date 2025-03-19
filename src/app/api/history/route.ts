import { type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { getAllScrapingTasks, getScrapingTask, saveScrapingTask, deleteScrapingTask } from '@/lib/storage/historyStorage';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 20, 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Get the current user (optional)
    const user = await getCurrentUser(request);
    
    // Get query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    
    // If ID is provided, get a specific task
    if (id) {
      const task = await getScrapingTask(id);
      
      if (!task) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Task not found' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Check if the task belongs to the user (if user is authenticated)
      if (user && task.userId && task.userId !== user.id) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Unauthorized' 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        task
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Otherwise, get all tasks (filtered by user if authenticated)
    const tasks = await getAllScrapingTasks(user?.id, limit);
    
    return new Response(JSON.stringify({ 
      success: true, 
      tasks
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('History error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to fetch history',
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 10, 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Get the current user (optional)
    const user = await getCurrentUser(request);
    
    const body = await request.json();
    const { url, instructions, waitFor, results } = body;
    
    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'URL is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Create the task
    const task = await saveScrapingTask({
      userId: user?.id,
      url,
      instructions,
      waitFor,
      timestamp: new Date().toISOString(),
      results
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'History saved',
      task
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('History error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to save history',
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 10, 60 * 1000);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Get the current user (required)
    const user = await getCurrentUser(request);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Authentication required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Task ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the task
    const task = await getScrapingTask(id);
    
    if (!task) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Task not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if the task belongs to the user
    if (task.userId && task.userId !== user.id) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Delete the task
    await deleteScrapingTask(id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Task deleted'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('History error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Failed to delete task',
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
