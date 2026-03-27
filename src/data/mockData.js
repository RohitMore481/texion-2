export const MOCK_USERS = [
  { id: 'u1', name: 'Alex Johnson', role: 'renter', workplace: { lat: 28.6139, lng: 77.2090 }, preferences: { maxCommute: 45, maxPrice: 40000 } },
  { id: 'u2', name: 'Sam Sharma', role: 'broker', agency: 'Premium Homes Reality', rating: 4.8 },
  { id: 'u3', name: 'Raj Patel', role: 'owner' }
];

export const MOCK_PROPERTIES = [
  {
    id: 'p1',
    title: 'Luxury 2BHK in South Ext.',
    price: 35000,
    location: { lat: 28.5677, lng: 77.2144, address: 'South Extension II, New Delhi' },
    status: 'available',
    ownerId: 'u3',
    brokerId: 'u2',
    amenities: ['hospital', 'grocery', 'gym', 'park'],
    expectations: ['vegetarian', 'family only'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    reviews: [{ user: 'Rahul', comment: 'Great safe neighborhood.', rating: 5 }]
  },
  {
    id: 'p2',
    title: 'Cozy 1BHK Studio Modern',
    price: 22000,
    location: { lat: 28.5360, lng: 77.2030, address: 'Saket, New Delhi' },
    status: 'occupied',
    ownerId: 'u3',
    brokerId: 'u2',
    amenities: ['grocery', 'metro'],
    expectations: ['no pets'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1e524d62b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    reviews: [{ user: 'Priya', comment: 'Commute is amazing.', rating: 4 }]
  },
  {
    id: 'p3',
    title: 'Spacious 3BHK Penthouse',
    price: 75000,
    location: { lat: 28.4595, lng: 77.0266, address: 'Cyber City, Gurugram' },
    status: 'available',
    ownerId: 'u3',
    brokerId: 'u2',
    amenities: ['hospital', 'grocery', 'gym', 'pool', 'mall'],
    expectations: ['corporate only'],
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    reviews: [{ user: 'Dev', comment: 'Very premium.', rating: 5 }]
  },
  {
    id: 'p4',
    title: 'Minimalist 2BHK Near Metro',
    price: 28000,
    location: { lat: 28.6289, lng: 77.0423, address: 'Dwarka Sector 21, New Delhi' },
    status: 'available',
    ownerId: 'u3',
    brokerId: 'u2',
    amenities: ['grocery', 'hospital', 'metro'],
    expectations: ['no girls allowed'], // Requested as a test filter in prompt
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    reviews: []
  },
  {
    id: 'p5',
    title: 'Affordable 1RK Room',
    price: 12000,
    location: { lat: 28.6505, lng: 77.2303, address: 'Chandni Chowk, New Delhi' },
    status: 'available',
    ownerId: 'u3',
    brokerId: 'u2',
    amenities: ['grocery'],
    expectations: ['bachelor only'],
    images: ['https://images.unsplash.com/photo-1549517045-bc93de0cecb6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    reviews: []
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'availability', propertyId: 'p2', message: 'The 1BHK Studio in Saket is now available!', read: false },
  { id: 'n2', type: 'system', message: 'Welcome to CommuteIQ. Set your workplace to get commute times.', read: true }
];
