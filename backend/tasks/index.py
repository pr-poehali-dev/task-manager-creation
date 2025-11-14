import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление задачами (CRUD операции)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('SELECT * FROM tasks ORDER BY created_at DESC')
            tasks = cursor.fetchall()
            
            result = []
            for task in tasks:
                result.append({
                    'id': str(task['id']),
                    'title': task['title'],
                    'priority': task['priority'],
                    'tags': task['tags'] or [],
                    'deadline': task['deadline'].isoformat() if task['deadline'] else None,
                    'completed': task['completed']
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title')
            priority = body.get('priority', 'medium')
            tags = body.get('tags', [])
            deadline = body.get('deadline')
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title is required'}),
                    'isBase64Encoded': False
                }
            
            deadline_value = None
            if deadline:
                deadline_value = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            
            cursor.execute(
                "INSERT INTO tasks (title, priority, tags, deadline) VALUES (%s, %s, %s, %s) RETURNING *",
                (title, priority, tags, deadline_value)
            )
            conn.commit()
            task = cursor.fetchone()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': str(task['id']),
                    'title': task['title'],
                    'priority': task['priority'],
                    'tags': task['tags'] or [],
                    'deadline': task['deadline'].isoformat() if task['deadline'] else None,
                    'completed': task['completed']
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')
            
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Task ID is required'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            params = []
            
            if 'title' in body:
                updates.append('title = %s')
                params.append(body['title'])
            if 'priority' in body:
                updates.append('priority = %s')
                params.append(body['priority'])
            if 'tags' in body:
                updates.append('tags = %s')
                params.append(body['tags'])
            if 'deadline' in body:
                updates.append('deadline = %s')
                deadline_value = None
                if body['deadline']:
                    deadline_value = datetime.fromisoformat(body['deadline'].replace('Z', '+00:00'))
                params.append(deadline_value)
            if 'completed' in body:
                updates.append('completed = %s')
                params.append(body['completed'])
            
            updates.append('updated_at = NOW()')
            params.append(task_id)
            
            query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = %s RETURNING *"
            cursor.execute(query, params)
            conn.commit()
            task = cursor.fetchone()
            
            if not task:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Task not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': str(task['id']),
                    'title': task['title'],
                    'priority': task['priority'],
                    'tags': task['tags'] or [],
                    'deadline': task['deadline'].isoformat() if task['deadline'] else None,
                    'completed': task['completed']
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            task_id = params.get('id')
            
            if not task_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Task ID is required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM tasks WHERE id = %s', (task_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
