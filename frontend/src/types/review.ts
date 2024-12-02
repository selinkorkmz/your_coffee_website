export interface Review {
  created_at: string | number | Date;
  name: string;
  review_id: string;
  user_id: string;
  rating: number;
  comment: string;
}
