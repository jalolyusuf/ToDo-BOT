// In production, nginx proxies /api/ to backend, so we can use relative path
// In development, use the env var or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

export type DependencyHealth = {
  status: "ok" | "error";
  detail?: string | null;
};

export type HealthResponse = {
  status: "ok" | "degraded";
  app: DependencyHealth;
  database: DependencyHealth;
  redis: DependencyHealth;
};

export type CurrentUserResponse = {
  id: string;
  telegram_user_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  language_code: string | null;
  can_create_groups: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function authRequest<T>(path: string, authHeader: string): Promise<T> {
  return request<T>(path, {
    headers: {
      Authorization: authHeader,
    },
  });
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/v1/health");
}

export function getAuthMe(authHeader: string): Promise<CurrentUserResponse> {
  return authRequest<CurrentUserResponse>("/api/v1/auth/me", authHeader);
}

// Helper for authenticated requests with body
async function authRequestWithBody<T>(
  path: string,
  authHeader: string,
  method: string,
  body?: unknown
): Promise<T> {
  return request<T>(path, {
    method,
    headers: {
      Authorization: authHeader,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Groups API
export type GroupResponse = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type GroupWithMemberCountResponse = GroupResponse & {
  member_count: number;
  user_role: 'owner' | 'member';
};

export type GroupMemberResponse = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  status: 'active' | 'inactive';
  user_first_name: string;
  user_last_name: string | null;
  user_username: string | null;
  created_at: string;
};

export type GroupListResponse = {
  groups: GroupWithMemberCountResponse[];
  total: number;
};

export type CreateGroupRequest = {
  name: string;
  description?: string;
};

export type UpdateGroupRequest = {
  name?: string;
  description?: string;
};

export function getGroups(authHeader: string): Promise<GroupListResponse> {
  return authRequest<GroupListResponse>("/api/v1/groups", authHeader);
}

export function createGroup(authHeader: string, data: CreateGroupRequest): Promise<GroupResponse> {
  return authRequestWithBody<GroupResponse>("/api/v1/groups", authHeader, "POST", data);
}

export function getGroup(authHeader: string, groupId: string): Promise<GroupResponse> {
  return authRequest<GroupResponse>(`/api/v1/groups/${groupId}`, authHeader);
}

export function updateGroup(authHeader: string, groupId: string, data: UpdateGroupRequest): Promise<GroupResponse> {
  return authRequestWithBody<GroupResponse>(`/api/v1/groups/${groupId}`, authHeader, "PATCH", data);
}

export function deleteGroup(authHeader: string, groupId: string): Promise<void> {
  return authRequestWithBody<void>(`/api/v1/groups/${groupId}`, authHeader, "DELETE");
}

export function getGroupMembers(authHeader: string, groupId: string): Promise<{ members: GroupMemberResponse[] }> {
  return authRequest<{ members: GroupMemberResponse[] }>(`/api/v1/groups/${groupId}/members`, authHeader);
}

export function addGroupMember(authHeader: string, groupId: string, userId: string): Promise<GroupMemberResponse> {
  return authRequestWithBody<GroupMemberResponse>(`/api/v1/groups/${groupId}/members`, authHeader, "POST", { user_id: userId });
}

export function removeGroupMember(authHeader: string, groupId: string, userId: string): Promise<void> {
  return authRequestWithBody<void>(`/api/v1/groups/${groupId}/members/${userId}`, authHeader, "DELETE");
}

// Tasks API
export type TaskStatus = 'created' | 'assigned' | 'in_progress' | 'on_hold' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TaskResponse = {
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
};

export type TaskWithDetailsResponse = TaskResponse & {
  creator_first_name: string;
  creator_last_name: string | null;
  creator_username: string | null;
  assignee_first_name: string | null;
  assignee_last_name: string | null;
  assignee_username: string | null;
};

export type TaskListResponse = {
  tasks: TaskWithDetailsResponse[];
  total: number;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  assignee_id?: string;
  group_id?: string;
};

export type UpdateTaskRequest = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  assignee_id?: string;
};

export type TaskFilterParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  creator_id?: string;
  group_id?: string;
  has_deadline?: boolean;
};

export function getTasks(authHeader: string, filters?: TaskFilterParams): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString();
  return authRequest<TaskListResponse>(`/api/v1/tasks${query ? `?${query}` : ""}`, authHeader);
}

export function createTask(authHeader: string, data: CreateTaskRequest): Promise<TaskResponse> {
  return authRequestWithBody<TaskResponse>("/api/v1/tasks", authHeader, "POST", data);
}

export function getTask(authHeader: string, taskId: string): Promise<TaskWithDetailsResponse> {
  return authRequest<TaskWithDetailsResponse>(`/api/v1/tasks/${taskId}`, authHeader);
}

export function updateTask(authHeader: string, taskId: string, data: UpdateTaskRequest): Promise<TaskResponse> {
  return authRequestWithBody<TaskResponse>(`/api/v1/tasks/${taskId}`, authHeader, "PATCH", data);
}

export function deleteTask(authHeader: string, taskId: string): Promise<void> {
  return authRequestWithBody<void>(`/api/v1/tasks/${taskId}`, authHeader, "DELETE");
}

export function updateTaskStatus(authHeader: string, taskId: string, status: TaskStatus): Promise<TaskResponse> {
  return authRequestWithBody<TaskResponse>(`/api/v1/tasks/${taskId}/status`, authHeader, "PATCH", { status });
}

export function assignTask(authHeader: string, taskId: string, assigneeId: string | null): Promise<TaskResponse> {
  return authRequestWithBody<TaskResponse>(`/api/v1/tasks/${taskId}/assign`, authHeader, "PATCH", { assignee_id: assigneeId });
}
