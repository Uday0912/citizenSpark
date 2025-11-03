export const demoDistricts = [
  {
    districtId: 'demo-001',
    districtName: 'Ahmedabad',
    stateName: 'Gujarat',
    stateCode: 'GJ',
    coordinates: { latitude: 23.0225, longitude: 72.5714 }
  },
  {
    districtId: 'demo-002',
    districtName: 'Bangalore Urban',
    stateName: 'Karnataka',
    stateCode: 'KA',
    coordinates: { latitude: 12.9716, longitude: 77.5946 }
  },
  {
    districtId: 'demo-003',
    districtName: 'Mumbai',
    stateName: 'Maharashtra',
    stateCode: 'MH',
    coordinates: { latitude: 19.0760, longitude: 72.8777 }
  },
  {
    districtId: 'demo-004',
    districtName: 'Delhi',
    stateName: 'Delhi',
    stateCode: 'DL',
    coordinates: { latitude: 28.7041, longitude: 77.1025 }
  },
  {
    districtId: 'demo-005',
    districtName: 'Chennai',
    stateName: 'Tamil Nadu',
    stateCode: 'TN',
    coordinates: { latitude: 13.0827, longitude: 80.2707 }
  }
];

export const demoMetrics = [
  {
    districtId: 'demo-001',
    districtName: 'Ahmedabad',
    stateName: 'Gujarat',
    year: 2024,
    month: 10,
    financialYear: '2024-25',
    totalHouseholds: 125000,
    householdsProvidedWork: 98000,
    totalPersons: 450000,
    personsProvidedWork: 380000,
    totalWorkdays: 1200000,
    workdaysGenerated: 1100000,
    totalWages: 45000000,
    wagesPaid: 42000000,
    employmentRate: 78.4,
    workCompletionRate: 91.7,
    wagePaymentRate: 93.3,
    lastUpdated: new Date()
  },
  {
    districtId: 'demo-002',
    districtName: 'Bangalore Urban',
    stateName: 'Karnataka',
    year: 2024,
    month: 10,
    financialYear: '2024-25',
    totalHouseholds: 95000,
    householdsProvidedWork: 85000,
    totalPersons: 380000,
    personsProvidedWork: 340000,
    totalWorkdays: 950000,
    workdaysGenerated: 900000,
    totalWages: 38000000,
    wagesPaid: 36000000,
    employmentRate: 89.5,
    workCompletionRate: 94.7,
    wagePaymentRate: 94.7,
    lastUpdated: new Date()
  },
  {
    districtId: 'demo-003',
    districtName: 'Mumbai',
    stateName: 'Maharashtra',
    year: 2024,
    month: 10,
    financialYear: '2024-25',
    totalHouseholds: 150000,
    householdsProvidedWork: 120000,
    totalPersons: 550000,
    personsProvidedWork: 480000,
    totalWorkdays: 1400000,
    workdaysGenerated: 1350000,
    totalWages: 55000000,
    wagesPaid: 52000000,
    employmentRate: 80.0,
    workCompletionRate: 96.4,
    wagePaymentRate: 94.5,
    lastUpdated: new Date()
  }
];

export const demoCacheStatus = {
  totalDistricts: 5,
  totalMetrics: 15,
  isHealthy: true,
  latestUpdate: new Date(),
  dataByState: [
    { _id: 'Gujarat', count: 1, lastUpdated: new Date() },
    { _id: 'Karnataka', count: 1, lastUpdated: new Date() },
    { _id: 'Maharashtra', count: 1, lastUpdated: new Date() },
    { _id: 'Delhi', count: 1, lastUpdated: new Date() },
    { _id: 'Tamil Nadu', count: 1, lastUpdated: new Date() }
  ]
};

