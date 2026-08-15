// User types
export interface User {
  id: string;
  telegram_user_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  language_code: string | null;
  is_active: boolean;
  can_create_groups: boolean;
  created_at: string;
  updated_at: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  status: 'active' | 'inactive';
  user_first_name: string;
  user_last_name: string | null;
  user_username: string | null;
  created_at: string;
}

export interface GroupWithMemberCount extends Group {
  member_count: number;
  user_role: 'owner' | 'member';
}

// Task types
export type TaskStatus = 'created' | 'assigned' | 'in_progress' | 'on_hold' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  creator_id: string;
  assignee_id: string | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  creator_first_name: string;
  creator_last_name: string | null;
  creator_username: string | null;
  assignee_first_name: string | null;
  assignee_last_name: string | null;
  assignee_username: string | null;
}

// API request types
export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  assignee_id?: string;
  group_id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  assignee_id?: string;
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  creator_id?: string;
  group_id?: string;
  has_deadline?: boolean;
}
