import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ExploreProfile from '@/models/ExploreProfile'
import User from '@/models/User'

// Seed 25 startup profiles
const startupProfiles = [
  {
    name: "TechFlow",
    tagline: "Streamline your workflow with AI-powered automation",
    description: "TechFlow revolutionizes business operations by integrating AI-driven automation into everyday workflows. Our platform helps teams save hours of manual work and focus on what matters most.",
    location: "San Francisco, CA",
    fundingStage: "series-a",
    dateStarted: new Date("2021-03-15"),
    contactEmail: "hello@techflow.io",
    contactPhone: "(415) 555-0123",
    website: "https://techflow.io",
    founders: [
      { name: "Sarah Chen", role: "CEO" },
      { name: "Michael Rodriguez", role: "CTO" }
    ],
    teamMembers: [
      { name: "Emily Johnson", role: "Head of Product" },
      { name: "David Kim", role: "Lead Engineer" }
    ],
    viewCount: 1240,
  },
  {
    name: "GreenSpace",
    tagline: "Sustainable living made simple",
    description: "GreenSpace connects eco-conscious consumers with sustainable products and services. We're building a marketplace that makes it easy to live sustainably without compromising on quality.",
    location: "Portland, OR",
    fundingStage: "seeded",
    dateStarted: new Date("2022-06-20"),
    contactEmail: "contact@greenspace.com",
    contactPhone: "(503) 555-0456",
    website: "https://greenspace.com",
    founders: [
      { name: "Alexandra Green", role: "Founder & CEO" }
    ],
    viewCount: 856,
  },
  {
    name: "HealthSync",
    tagline: "Your health data, unified",
    description: "HealthSync aggregates health data from all your devices and apps into one comprehensive dashboard. Take control of your wellness journey with actionable insights.",
    location: "Boston, MA",
    fundingStage: "series-b",
    dateStarted: new Date("2020-01-10"),
    contactEmail: "info@healthsync.app",
    contactPhone: "(617) 555-0789",
    website: "https://healthsync.app",
    founders: [
      { name: "Dr. James Wilson", role: "CEO" },
      { name: "Lisa Park", role: "Chief Medical Officer" }
    ],
    teamMembers: [
      { name: "Robert Taylor", role: "VP Engineering" }
    ],
    viewCount: 2100,
  },
  {
    name: "EduLearn",
    tagline: "Personalized learning for everyone",
    description: "EduLearn uses adaptive AI to create personalized learning paths for students of all ages. Our platform makes education accessible, engaging, and effective.",
    location: "Austin, TX",
    fundingStage: "pre-seeded",
    dateStarted: new Date("2023-02-14"),
    contactEmail: "hello@edulearn.io",
    contactPhone: "(512) 555-0321",
    website: "https://edulearn.io",
    founders: [
      { name: "Maria Garcia", role: "Co-Founder" },
      { name: "Thomas Anderson", role: "Co-Founder" }
    ],
    viewCount: 432,
  },
  {
    name: "FoodieConnect",
    tagline: "Discover local food experiences",
    description: "FoodieConnect connects food lovers with unique dining experiences, pop-up events, and local chefs. Discover hidden culinary gems in your city.",
    location: "New York, NY",
    fundingStage: "bootstrapped",
    dateStarted: new Date("2021-09-05"),
    contactEmail: "team@foodieconnect.com",
    contactPhone: "(212) 555-0654",
    website: "https://foodieconnect.com",
    founders: [
      { name: "Chef Marcus Brown", role: "Founder" }
    ],
    viewCount: 1890,
  },
  {
    name: "CloudVault",
    tagline: "Secure cloud storage reimagined",
    description: "CloudVault provides enterprise-grade security with consumer-friendly simplicity. Your data is encrypted, backed up, and accessible from anywhere.",
    location: "Seattle, WA",
    fundingStage: "series-a",
    dateStarted: new Date("2020-11-30"),
    contactEmail: "support@cloudvault.io",
    contactPhone: "(206) 555-0987",
    website: "https://cloudvault.io",
    founders: [
      { name: "Jennifer Lee", role: "CEO" },
      { name: "Kevin Zhang", role: "CTO" }
    ],
    teamMembers: [
      { name: "Amanda White", role: "Head of Security" }
    ],
    viewCount: 1650,
  },
  {
    name: "FitTrack",
    tagline: "Your fitness journey, tracked",
    description: "FitTrack combines wearable technology with AI coaching to help you achieve your fitness goals. Get personalized workout plans and nutrition advice.",
    location: "Denver, CO",
    fundingStage: "seeded",
    dateStarted: new Date("2022-04-18"),
    contactEmail: "hello@fittrack.fit",
    contactPhone: "(303) 555-0147",
    website: "https://fittrack.fit",
    founders: [
      { name: "Ryan Martinez", role: "Founder & CEO" }
    ],
    viewCount: 920,
  },
  {
    name: "CodeCollab",
    tagline: "Code together, build faster",
    description: "CodeCollab is a real-time collaborative coding platform that makes pair programming seamless. Work together with your team from anywhere in the world.",
    location: "San Jose, CA",
    fundingStage: "series-b",
    dateStarted: new Date("2019-08-22"),
    contactEmail: "contact@codecollab.dev",
    contactPhone: "(408) 555-0258",
    website: "https://codecollab.dev",
    founders: [
      { name: "Priya Patel", role: "CEO" },
      { name: "Daniel Kim", role: "CTO" }
    ],
    teamMembers: [
      { name: "Sophie Chen", role: "VP Product" },
      { name: "Chris Johnson", role: "Lead Architect" }
    ],
    viewCount: 3200,
  },
  {
    name: "ArtisanHub",
    tagline: "Handcrafted goods marketplace",
    description: "ArtisanHub connects talented artisans with customers who appreciate handmade quality. Discover unique, one-of-a-kind products from independent creators.",
    location: "Portland, ME",
    fundingStage: "pre-seeded",
    dateStarted: new Date("2023-01-10"),
    contactEmail: "info@artisanhub.com",
    contactPhone: "(207) 555-0369",
    website: "https://artisanhub.com",
    founders: [
      { name: "Emma Thompson", role: "Founder" }
    ],
    viewCount: 567,
  },
  {
    name: "FinanceWise",
    tagline: "Smart financial planning for everyone",
    description: "FinanceWise democratizes financial planning with AI-powered tools that help individuals and families make better money decisions. Plan for your future with confidence.",
    location: "Chicago, IL",
    fundingStage: "series-a",
    dateStarted: new Date("2021-05-12"),
    contactEmail: "hello@financewise.com",
    contactPhone: "(312) 555-0741",
    website: "https://financewise.com",
    founders: [
      { name: "Robert Chen", role: "CEO" },
      { name: "Michelle Davis", role: "CFO" }
    ],
    viewCount: 1450,
  },
  {
    name: "TravelLocal",
    tagline: "Authentic travel experiences",
    description: "TravelLocal connects travelers with local guides for authentic, off-the-beaten-path experiences. Discover the real culture of your destination.",
    location: "Miami, FL",
    fundingStage: "seeded",
    dateStarted: new Date("2022-07-08"),
    contactEmail: "contact@travellocal.com",
    contactPhone: "(305) 555-0523",
    website: "https://travellocal.com",
    founders: [
      { name: "Carlos Mendez", role: "Founder" }
    ],
    viewCount: 1100,
  },
  {
    name: "MindfulApp",
    tagline: "Meditation and mindfulness made easy",
    description: "MindfulApp offers guided meditation sessions, breathing exercises, and mindfulness tools to help you reduce stress and improve mental well-being.",
    location: "Los Angeles, CA",
    fundingStage: "bootstrapped",
    dateStarted: new Date("2021-12-01"),
    contactEmail: "hello@mindfulapp.com",
    contactPhone: "(310) 555-0896",
    website: "https://mindfulapp.com",
    founders: [
      { name: "Yoga Master Sarah", role: "Founder" }
    ],
    viewCount: 1780,
  },
  {
    name: "PetCare Pro",
    tagline: "Complete pet health management",
    description: "PetCare Pro helps pet owners manage their furry friends' health with appointment scheduling, vaccination reminders, and vet records all in one place.",
    location: "Phoenix, AZ",
    fundingStage: "pre-seeded",
    dateStarted: new Date("2023-03-20"),
    contactEmail: "info@petcarepro.com",
    contactPhone: "(602) 555-0412",
    website: "https://petcarepro.com",
    founders: [
      { name: "Dr. Amanda Foster", role: "Founder" }
    ],
    viewCount: 689,
  },
  {
    name: "HomeSmart",
    tagline: "Intelligent home automation",
    description: "HomeSmart integrates all your smart home devices into one intuitive platform. Control lights, temperature, security, and more from a single app.",
    location: "Seattle, WA",
    fundingStage: "series-a",
    dateStarted: new Date("2020-10-15"),
    contactEmail: "support@homesmart.io",
    contactPhone: "(206) 555-0174",
    website: "https://homesmart.io",
    founders: [
      { name: "Alex Turner", role: "CEO" },
      { name: "Jordan Smith", role: "CTO" }
    ],
    viewCount: 2100,
  },
  {
    name: "StudyBuddy",
    tagline: "Study smarter, not harder",
    description: "StudyBuddy uses AI to create personalized study plans, track progress, and help students ace their exams. Make learning efficient and enjoyable.",
    location: "Cambridge, MA",
    fundingStage: "seeded",
    dateStarted: new Date("2022-09-12"),
    contactEmail: "hello@studybuddy.app",
    contactPhone: "(617) 555-0632",
    website: "https://studybuddy.app",
    founders: [
      { name: "Rachel Kim", role: "Founder" }
    ],
    viewCount: 1340,
  },
  {
    name: "LocalEats",
    tagline: "Support local restaurants",
    description: "LocalEats helps you discover and support independent restaurants in your area. Find hidden gems, read authentic reviews, and order directly from local chefs.",
    location: "Portland, OR",
    fundingStage: "bootstrapped",
    dateStarted: new Date("2021-11-25"),
    contactEmail: "contact@localeats.com",
    contactPhone: "(503) 555-0857",
    website: "https://localeats.com",
    founders: [
      { name: "Chef Maria Lopez", role: "Founder" }
    ],
    viewCount: 1560,
  },
  {
    name: "TaskMaster",
    tagline: "Project management simplified",
    description: "TaskMaster brings teams together with intuitive project management tools. Track progress, collaborate in real-time, and deliver projects on time.",
    location: "New York, NY",
    fundingStage: "series-b",
    dateStarted: new Date("2019-04-10"),
    contactEmail: "team@taskmaster.io",
    contactPhone: "(212) 555-0296",
    website: "https://taskmaster.io",
    founders: [
      { name: "David Park", role: "CEO" },
      { name: "Lisa Chen", role: "CPO" }
    ],
    teamMembers: [
      { name: "Michael Brown", role: "VP Engineering" }
    ],
    viewCount: 2800,
  },
  {
    name: "EcoRide",
    tagline: "Sustainable transportation solutions",
    description: "EcoRide connects commuters with electric vehicle sharing and public transit options. Reduce your carbon footprint while getting around the city.",
    location: "San Francisco, CA",
    fundingStage: "series-a",
    dateStarted: new Date("2021-02-28"),
    contactEmail: "hello@ecoride.com",
    contactPhone: "(415) 555-0715",
    website: "https://ecoride.com",
    founders: [
      { name: "Emma Green", role: "CEO" }
    ],
    viewCount: 1920,
  },
  {
    name: "MusicMatch",
    tagline: "Discover your next favorite song",
    description: "MusicMatch uses AI to analyze your music taste and recommend new artists and songs you'll love. Expand your musical horizons with personalized suggestions.",
    location: "Nashville, TN",
    fundingStage: "seeded",
    dateStarted: new Date("2022-05-15"),
    contactEmail: "info@musicmatch.app",
    contactPhone: "(615) 555-0482",
    website: "https://musicmatch.app",
    founders: [
      { name: "Jake Williams", role: "Founder" }
    ],
    viewCount: 980,
  },
  {
    name: "CodeAcademy Pro",
    tagline: "Learn to code, land your dream job",
    description: "CodeAcademy Pro offers intensive coding bootcamps with job placement guarantees. Transform your career with hands-on learning and industry mentorship.",
    location: "San Francisco, CA",
    fundingStage: "series-a",
    dateStarted: new Date("2020-06-20"),
    contactEmail: "admissions@codeacademypro.com",
    contactPhone: "(415) 555-0936",
    website: "https://codeacademypro.com",
    founders: [
      { name: "Dr. Sarah Johnson", role: "CEO" },
      { name: "Mark Thompson", role: "CTO" }
    ],
    viewCount: 2400,
  },
  {
    name: "WellnessWave",
    tagline: "Holistic health and wellness",
    description: "WellnessWave combines nutrition, fitness, and mental health tracking in one comprehensive platform. Achieve your wellness goals with personalized guidance.",
    location: "Boulder, CO",
    fundingStage: "pre-seeded",
    dateStarted: new Date("2023-04-05"),
    contactEmail: "hello@wellnesswave.com",
    contactPhone: "(303) 555-0274",
    website: "https://wellnesswave.com",
    founders: [
      { name: "Dr. Jessica Martinez", role: "Founder" }
    ],
    viewCount: 745,
  },
  {
    name: "ShopLocal",
    tagline: "Support small businesses",
    description: "ShopLocal helps you discover and support independent retailers in your community. Find unique products while keeping money in your local economy.",
    location: "Austin, TX",
    fundingStage: "bootstrapped",
    dateStarted: new Date("2021-08-30"),
    contactEmail: "contact@shoplocal.com",
    contactPhone: "(512) 555-0618",
    website: "https://shoplocal.com",
    founders: [
      { name: "Tom Anderson", role: "Founder" }
    ],
    viewCount: 1230,
  },
  {
    name: "DataViz Pro",
    tagline: "Beautiful data visualizations",
    description: "DataViz Pro transforms complex data into stunning, interactive visualizations. Make your data tell a story with our powerful visualization tools.",
    location: "Boston, MA",
    fundingStage: "series-b",
    dateStarted: new Date("2019-11-12"),
    contactEmail: "hello@datavizpro.com",
    contactPhone: "(617) 555-0547",
    website: "https://datavizpro.com",
    founders: [
      { name: "Dr. Emily Chen", role: "CEO" },
      { name: "Ryan Kim", role: "CTO" }
    ],
    teamMembers: [
      { name: "Sophia Lee", role: "Head of Design" }
    ],
    viewCount: 1950,
  },
  {
    name: "EventSpace",
    tagline: "Find and book event venues",
    description: "EventSpace connects event planners with unique venues. From intimate gatherings to large conferences, find the perfect space for your next event.",
    location: "Los Angeles, CA",
    fundingStage: "seeded",
    dateStarted: new Date("2022-03-18"),
    contactEmail: "info@eventspace.com",
    contactPhone: "(310) 555-0821",
    website: "https://eventspace.com",
    founders: [
      { name: "Maria Rodriguez", role: "Founder" }
    ],
    viewCount: 1120,
  },
  {
    name: "CodeReview AI",
    tagline: "AI-powered code quality",
    description: "CodeReview AI automatically reviews your code, suggests improvements, and helps maintain high code quality standards. Ship better code, faster.",
    location: "Seattle, WA",
    fundingStage: "series-a",
    dateStarted: new Date("2021-01-25"),
    contactEmail: "hello@codereviewai.com",
    contactPhone: "(206) 555-0395",
    website: "https://codereviewai.com",
    founders: [
      { name: "Alex Chen", role: "CEO" },
      { name: "David Park", role: "CTO" }
    ],
    viewCount: 1680,
  },
  {
    name: "FitMeal",
    tagline: "Healthy meals delivered",
    description: "FitMeal delivers nutritious, chef-prepared meals tailored to your dietary needs and fitness goals. Eat well without the hassle of meal prep.",
    location: "Denver, CO",
    fundingStage: "pre-seeded",
    dateStarted: new Date("2023-02-08"),
    contactEmail: "hello@fitmeal.com",
    contactPhone: "(303) 555-0163",
    website: "https://fitmeal.com",
    founders: [
      { name: "Chef James Wilson", role: "Founder" }
    ],
    viewCount: 890,
  },
]

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get or create a default user for seeding
    let seedUser = await User.findOne({ email: 'seed@example.com' })
    
    if (!seedUser) {
      seedUser = await User.create({
        name: 'Seed User',
        email: 'seed@example.com',
        password: 'hashedpassword', // This won't work for login, just for seeding
      })
    }

    // Check if profiles already exist
    const existingCount = await ExploreProfile.countDocuments({ userId: seedUser._id })
    if (existingCount >= 25) {
      return NextResponse.json(
        { message: 'Profiles already seeded', count: existingCount },
        { status: 200 }
      )
    }

    // Create profiles
    const createdProfiles = []
    for (const profileData of startupProfiles) {
      const profile = await ExploreProfile.create({
        userId: seedUser._id,
        type: 'startup',
        ...profileData,
        isPublished: true,
        isFeatured: Math.random() > 0.7, // Randomly feature some
        likes: [],
        viewCount: profileData.viewCount || Math.floor(Math.random() * 2000),
      })
      createdProfiles.push(profile.name)
    }

    return NextResponse.json(
      {
        message: 'Successfully seeded startup profiles',
        count: createdProfiles.length,
        profiles: createdProfiles,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

