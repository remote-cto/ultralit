// app/api/get-topic-content/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../utils/database";

interface DatabaseClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  release: () => void;
}

interface TopicContent {
  id: number;
  topic_id: number;
  day_number: number;
  title: string;
  description: string | null;
  content_text: string;
  created_at: string;
  updated_at: string;
}

interface UserContentProgress {
  delivery_id: number;
  day_number: number;
  is_sent: boolean;
  delivered_on: string | null;
  created_at: string;
}

interface TopicContentResponse {
  topic_id: number;
  topic_name: string;
  content: TopicContent[];
  user_progress: UserContentProgress[];
  total_days: number;
  current_day: number;
  next_delivery_date: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const client = await pool.connect() as DatabaseClient;
  
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const topic_id = searchParams.get('topic_id');
    const limit = searchParams.get('limit'); 

    // Validate required parameters
    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing user_id parameter'
      }, { status: 400 });
    }

    // If topic_id is provided, get content for specific topic
    if (topic_id) {
      // Verify user has access to this topic
      const accessQuery = `
        SELECT ut.topic_id, t.name as topic_name
        FROM user_topics ut
        JOIN topics t ON t.id = ut.topic_id
        WHERE ut.user_id = $1 AND ut.topic_id = $2
      `;
      
      const accessResult = await client.query(accessQuery, [user_id, topic_id]);
      
      if (accessResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User does not have access to this topic'
        }, { status: 403 });
      }

      const topicName = accessResult.rows[0].topic_name;

      // Get all content for this topic
      let contentQuery = `
        SELECT id, topic_id, day_number, title, description, content_text, created_at, updated_at
        FROM content
        WHERE topic_id = $1
        ORDER BY day_number ASC
      `;
      
      const contentParams = [topic_id];
      
      if (limit) {
        contentQuery += ` LIMIT $2`;
        contentParams.push(limit);
      }

      const contentResult = await client.query(contentQuery, contentParams);

      
      const progressQuery = `
        SELECT id as delivery_id, day_number, is_sent, delivered_on, created_at
        FROM user_content_delivery
        WHERE user_id = $1 AND topic_id = $2
        ORDER BY day_number ASC
      `;
      
      const progressResult = await client.query(progressQuery, [user_id, topic_id]);

      // Calculate current day and next delivery
      const progress = progressResult.rows as UserContentProgress[];
      const currentDay = progress.length > 0 ? Math.max(...progress.map(p => p.day_number)) : 0;
      const nextPendingDelivery = progress.find(p => !p.is_sent);
      
      const response: TopicContentResponse = {
        topic_id: parseInt(topic_id),
        topic_name: topicName,
        content: contentResult.rows as TopicContent[],
        user_progress: progress,
        total_days: contentResult.rows.length,
        current_day: currentDay,
        next_delivery_date: nextPendingDelivery?.created_at || null
      };

      return NextResponse.json({
        success: true,
        data: response
      });
    }

    // If no specific topic_id, get content for all user's topics
    const userTopicsQuery = `
      SELECT 
        ut.topic_id,
        t.name as topic_name,
        COUNT(c.id) as total_content_days,
        MAX(ucd.day_number) as current_day,
        COUNT(CASE WHEN ucd.is_sent = true THEN 1 END) as delivered_count,
        COUNT(CASE WHEN ucd.is_sent = false THEN 1 END) as pending_count
      FROM user_topics ut
      JOIN topics t ON t.id = ut.topic_id
      LEFT JOIN content c ON c.topic_id = ut.topic_id
      LEFT JOIN user_content_delivery ucd ON ucd.user_id = ut.user_id AND ucd.topic_id = ut.topic_id
      WHERE ut.user_id = $1
      GROUP BY ut.topic_id, t.name
      ORDER BY t.name ASC
    `;

    const userTopicsResult = await client.query(userTopicsQuery, [user_id]);

    // Get recent content for preview (last 5 delivered items across all topics)
    const recentContentQuery = `
      SELECT 
        ucd.topic_id,
        t.name as topic_name,
        c.title,
        c.description,
        ucd.day_number,
        ucd.delivered_on,
        c.created_at as content_created_at
      FROM user_content_delivery ucd
      JOIN topics t ON t.id = ucd.topic_id
      JOIN content c ON c.topic_id = ucd.topic_id AND c.day_number = ucd.day_number
      WHERE ucd.user_id = $1 AND ucd.is_sent = true
      ORDER BY ucd.delivered_on DESC
      LIMIT 5
    `;

    const recentContentResult = await client.query(recentContentQuery, [user_id]);

    return NextResponse.json({
      success: true,
      data: {
        user_topics_summary: userTopicsResult.rows,
        recent_content: recentContentResult.rows,
        total_topics: userTopicsResult.rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching topic content:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    client.release();
  }
}