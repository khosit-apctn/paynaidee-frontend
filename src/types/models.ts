// Core data model interfaces for PayNaiDee

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  display_name: string;
  avatar: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  avatar: string;
  created_by: number;
  creator: User;
  members: GroupMember[];
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: 'admin' | 'member';
  user: User;
  joined_at: string;
}

export interface Message {
  id: number;
  group_id: number;
  sender_id: number;
  content: string;
  type: 'text' | 'bill' | 'system';
  metadata: string;
  sender: User;
  created_at: string;
}

export interface Bill {
  id: number;
  group_id: number;
  created_by: number;
  title: string;
  description: string;
  total_amount: number;
  service_charge: number;
  split_type: 'equal' | 'custom';
  status: 'pending' | 'settled';
  qr_header: string;
  creator: User;
  group: Group;
  participants: BillParticipant[];
  created_at: string;
  updated_at: string;
}

export interface BillParticipant {
  id: number;
  bill_id: number;
  user_id: number;
  amount: number;
  payment_status: 'pending' | 'paid';
  user: User;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  requester: User;
  addressee: User;
  created_at: string;
  updated_at: string;
}

export interface QRCodeResponse {
  qr_data: string;
  amount: number;
  identifier: string;
  header: string;
  bill_id: number;
  payee_user_id: number;
}
