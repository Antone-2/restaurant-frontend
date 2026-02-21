export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export const reviews: Review[] = [
  {
    id: "1",
    name: "James Ochieng",
    rating: 5,
    comment: "The best nyama choma in Korinda! The 24-hour service is a lifesaver. Great ambiance and friendly staff.",
    date: "2025-12-15",
  },
  {
    id: "2",
    name: "Mary Wanjiku",
    rating: 4,
    comment: "Lovely place with amazing food. The grilled chicken is to die for. Prices are very reasonable.",
    date: "2025-11-28",
  },
  {
    id: "3",
    name: "Peter Kimani",
    rating: 4,
    comment: "Great atmosphere and delicious meals. The delivery service is prompt and reliable. Highly recommend!",
    date: "2025-10-20",
  },
  {
    id: "4",
    name: "Sarah Akinyi",
    rating: 3,
    comment: "Good food but service can be slow during peak hours. The cocktails are excellent though!",
    date: "2025-09-10",
  },
];
