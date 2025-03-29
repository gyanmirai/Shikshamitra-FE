interface Student {
  name: string;
  grade: string;
  rollNumber: string;
}

interface Stop {
  stopName: string;
  pickUpTime: string;
  dropOffTime: string;
  assignedRiders: number;
  students: Student[];
}

export interface Route {
  routeName: string;
  vehicle: string;
  driver: string;
  totalStops: number;
  totalRiders: number;
  startPointLatAndLong: [number, number];
  endPointLatAndLong: [number, number];
  wayPointLatAndLong: [number, number][];
  stops: Stop[];
}

export const routesData: Route[] = [
  {
    routeName: 'Route 1 - North Campus',
    vehicle: 'Bus 1',
    driver: 'Rajesh Kumar',
    totalStops: 4,
    totalRiders: 16,
    startPointLatAndLong: [21.233659274910956, 72.862602819098],
    endPointLatAndLong: [21.14843573826047, 72.88572990744605],
    wayPointLatAndLong: [
      [21.200659, 72.870602],
      [21.180435, 72.880729],
    ],
    stops: [
      {
        stopName: 'MG Road Metro Station',
        pickUpTime: '08:00 AM',
        dropOffTime: '03:30 PM',
        assignedRiders: 15,
        students: [
          { name: 'Aryan Sharma', grade: '10', rollNumber: 'S101' },
          { name: 'Priya Singh', grade: '8', rollNumber: 'S102' },
          { name: 'Kunal Verma', grade: '9', rollNumber: 'S103' },
          { name: 'Sneha Gupta', grade: '7', rollNumber: 'S104' },
          { name: 'Rohit Das', grade: '11', rollNumber: 'S105' },
          { name: 'Ayesha Khan', grade: '6', rollNumber: 'S106' },
        ],
      },
      {
        stopName: 'Cyber City Tower 5',
        pickUpTime: '08:15 AM',
        dropOffTime: '03:15 PM',
        assignedRiders: 10,
        students: [
          { name: 'Ananya Roy', grade: '8', rollNumber: 'S107' },
          { name: 'Arjun Patel', grade: '10', rollNumber: 'S108' },
          { name: 'Ritika Mehra', grade: '9', rollNumber: 'S109' },
          { name: 'Kabir Malhotra', grade: '12', rollNumber: 'S110' },
          { name: 'Manav Joshi', grade: '7', rollNumber: 'S111' },
        ],
      },
      {
        stopName: 'DLF Phase 2 Gate 3',
        pickUpTime: '08:30 AM',
        dropOffTime: '03:00 PM',
        assignedRiders: 20,
        students: [
          { name: 'Ishita Pandey', grade: '11', rollNumber: 'S112' },
          { name: 'Harsh Vardhan', grade: '6', rollNumber: 'S113' },
          { name: 'Nidhi Kapoor', grade: '8', rollNumber: 'S114' },
          { name: 'Sanjana Iyer', grade: '10', rollNumber: 'S115' },
        ],
      },
      {
        stopName: 'Sector 14 Market',
        pickUpTime: '08:45 AM',
        dropOffTime: '02:45 PM',
        assignedRiders: 25,
        students: [
          { name: 'Rajiv Nair', grade: '7', rollNumber: 'S201' },
          { name: 'Meera Kapoor', grade: '9', rollNumber: 'S202' },
          { name: 'Akash Jain', grade: '11', rollNumber: 'S203' },
        ],
      },
    ],
  },
  {
    routeName: 'Route 2 - South City',
    vehicle: 'Van 1',
    driver: 'Anita Verma',
    totalStops: 4,
    totalRiders: 16,
    startPointLatAndLong: [21.14856834029464, 72.88578355767018],
    endPointLatAndLong: [21.212188582367023, 72.89996326440937],
    wayPointLatAndLong: [
      [21.200659, 72.870602],
      [21.180435, 72.880729],
    ],
    stops: [
      {
        stopName: 'Huda City Centre',
        pickUpTime: '07:45 AM',
        dropOffTime: '03:15 PM',
        assignedRiders: 8,
        students: [
          { name: 'Divya Reddy', grade: '8', rollNumber: 'S204' },
          { name: 'Neha Saxena', grade: '10', rollNumber: 'S205' },
          { name: 'Aditya Bansal', grade: '6', rollNumber: 'S206' },
          { name: 'Pooja Mishra', grade: '8', rollNumber: 'S207' },
        ],
      },
      {
        stopName: 'Sector 40 Community Center',
        pickUpTime: '08:00 AM',
        dropOffTime: '03:00 PM',
        assignedRiders: 7,
        students: [
          { name: 'Rohan Malhotra', grade: '7', rollNumber: 'S208' },
          { name: 'Simran Chawla', grade: '12', rollNumber: 'S209' },
          { name: 'Ankit Tiwari', grade: '10', rollNumber: 'S210' },
        ],
      },
    ],
  },
  {
    routeName: 'Route 3 - West Side',
    vehicle: 'Bus 2',
    driver: 'Vikram Singh',
    totalStops: 4,
    totalRiders: 5,
    startPointLatAndLong: [21.233659274910956, 72.862602819098],
    endPointLatAndLong: [21.14843573826047, 72.88572990744605],
    wayPointLatAndLong: [
      [21.200659, 72.870602],
      [21.180435, 72.880729],
    ],
    stops: [
      {
        stopName: 'Rajiv Chowk',
        pickUpTime: '07:30 AM',
        dropOffTime: '03:30 PM',
        assignedRiders: 18,
        students: [
          { name: 'Isha Mathur', grade: '7', rollNumber: 'S302' },
          { name: 'Ravi Yadav', grade: '8', rollNumber: 'S303' },
          { name: 'Tanya Bhardwaj', grade: '9', rollNumber: 'S304' },
          { name: 'Aman Chandra', grade: '10', rollNumber: 'S305' },
        ],
      },
      {
        stopName: 'Udyog Vihar Phase 4',
        pickUpTime: '07:45 AM',
        dropOffTime: '03:15 PM',
        assignedRiders: 22,
        students: [
          { name: 'Kritika Singh', grade: '11', rollNumber: 'S306' },
          { name: 'Anshuman Rao', grade: '12', rollNumber: 'S307' },
          { name: 'Pallavi Das', grade: '8', rollNumber: 'S308' },
          { name: 'Rahul Tripathi', grade: '9', rollNumber: 'S309' },
        ],
      },
      {
        stopName: 'IFFCO Chowk Metro Station',
        pickUpTime: '08:00 AM',
        dropOffTime: '03:00 PM',
        assignedRiders: 30,
        students: [
          { name: 'Anjali Sinha', grade: '11', rollNumber: 'S313' },
          { name: 'Kartik Goel', grade: '12', rollNumber: 'S314' },
          { name: 'Pranav Joshi', grade: '9', rollNumber: 'S315' },
          { name: 'Ira Sharma', grade: '7', rollNumber: 'S316' },
        ],
      },
      {
        stopName: 'Sector 17 Post Office',
        pickUpTime: '08:15 AM',
        dropOffTime: '02:45 PM',
        assignedRiders: 25,
        students: [
          { name: 'Shivani Thakur', grade: '6', rollNumber: 'S310' },
          { name: 'Ritika Sehgal', grade: '7', rollNumber: 'S311' },
          { name: 'Nikhil Tandon', grade: '10', rollNumber: 'S312' },
        ],
      },
    ],
  },
];
