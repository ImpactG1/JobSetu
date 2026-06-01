import {
  UserProfile,
  MetricCard,
  TimelineItem,
  SavedJob,
  FollowUpReminder,
  TrendingOpportunity,
  JobOpportunity,
  EmailThread,
  ReferralCandidate,
  TopReferrer,
  EmailTemplate
} from './types';

export const PROFILES: UserProfile[] = [
  {
    name: 'Alexander Thorne',
    role: 'Chief Strategy Officer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMyoZP_i4iQ8ZUyuiB-E1NX_23r_NYqsjigqvXiQ9vFmkaYKrFZZCamM11xmdEyMIdbbWENBQJa1jQWn649BuPSufwZhocXCx7ZnV24idSr2hkoZNF9RvX4MeqMS1wUt_DlDiIbY6OR2ynd0TIN-Gop9dSLlJ9BFEHAuZz3Kfb3wjz42RS32u6VNvVDJLfHWpni5ZzxeVhuhqVfMwORoOCm6hhBGv_3XhyHd6OjIqjHkWGpR-giA9gns9jkgFT0_o0DoSug2jMiy9Q',
    email: 'alexander.thorne@elitehr.com'
  },
  {
    name: 'Alex Mercer',
    role: 'Lead Recruiter',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzGoHNSKY6utS63JGYyg4J5CC1mtG3aL1wq9r4ZBq5GTM9Xt3d9sCd1Ml6gHwXFp2B0IG_AhEbnxv8-6qT7aU66L1w0_P5pidaqwyUDPnaGP5MlnfLhswUUvKZTTFopJ2aOo1a4B7qj71RpGcpLAgzutPIFRBS5JJdA0jaKluEDySIMZ74axVi8z4iFkRtlIomCHDQdzQpT-76h9RAx8cjNhmIQKvzN_5uOHbC1fGvXKTFKq5OCBTPvZAJ6F0Awyq10jMYWDg-YfC_',
    email: 'alex.mercer@elitehr.com'
  },
  {
    name: 'Alex Sterling',
    role: 'Partner',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9_r5WGo8ZIAOjjcIP9jufoBfJ1Iu5g4QPVHSA2oSCTxC_k177c04PE0pGlAuRqKBCm0yzHmh-b0DxxWF_s_NSe3-h9R_dIvayA1mPLMcAO0okesxOsLclExs82QEXL0DHeWEnXqtmTUiGvoxXG2jm-XBfE1tu5hkY7bQOpj8FLAnDaiHUkfSUPhOI_cQaMGKdUpo9QpaPZB-Ar-9CGKRm02FTIi_WcQ8Ag0UcDN8w1cFB9ry5tOktimnghrZzh7WkZ-7kJycdm5gE',
    email: 'alex.sterling@elitehr.com'
  },
  {
    name: 'Arthur Sterling',
    role: 'Managing Director',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIvSwILQ7vnDSA1WrkjuIYig-IfDVD2dyQvdxD80u3Dfb8Mtjymh_kjbrcwwXLHRqFybTaUxigR6YmpbtzAzec8mmHbORfi2BI9swpWB26WILtc0xqHgwv857BRKeWCYCk7GZyP4cPp9AGCQKvpMHDteDDo7DfRYO7Q73Jt2Rdg_T3igo9ouGUf3KQKbSEQXB-8aVwFzWiIPguSfUhuiJ6he3-LLJM5E7etHbqi2NlYxGxZCwrZZC9YfqlIBILL9x3l0bIrvEZNXre',
    email: 'arthur.sterling@elitehr.com'
  }
];

export const HOME_KPI_CARDS: MetricCard[] = [
  {
    title: 'Emails Sent',
    value: '1,284',
    change: '+12%',
    isPositive: true,
    icon: 'forward_to_inbox'
  },
  {
    title: 'Referrals Made',
    value: '42',
    change: '+5%',
    isPositive: true,
    icon: 'group_add'
  },
  {
    title: 'Applications Tracked',
    value: '156',
    change: 'Stable',
    isPositive: true,
    icon: 'analytics'
  },
  {
    title: 'Response Rate',
    value: '94.2%',
    change: '-2%',
    isPositive: false,
    icon: 'speed'
  }
];

export const TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: 'timeline-1',
    title: 'Candidate Interview Completed',
    description: 'Successfully screened Julian Vane for the VP of Engineering role. Feedback submitted to the board.',
    time: '2h ago',
    type: 'interview',
    isHighPriority: true
  },
  {
    id: 'timeline-2',
    title: 'Offer Letter Sent',
    description: 'Drafted and sent an offer for Senior Product Designer to Maria Gonzalez.',
    time: '5h ago',
    type: 'offer'
  },
  {
    id: 'timeline-3',
    title: 'New Referral Received',
    description: 'David Chen referred Sarah L. for the Global Operations lead.',
    time: 'Yesterday',
    type: 'referral'
  },
  {
    id: 'timeline-4',
    title: 'Updated Job Description',
    description: "Revised requirements for the 'Director of Growth' role at MetaLab.",
    time: 'Yesterday',
    type: 'update'
  }
];

export const SAVED_JOBS: SavedJob[] = [
  {
    id: 'saved-1',
    title: 'Chief Technology Officer',
    company: 'Linear',
    location: 'San Francisco',
    salary: '$280k - $350k',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJ6YsUeDwgfVq1LOm_Lsq-WnNlEjQbG0qC-h51ODeXjnpcsReBIxPtdtB74p7sEwbuQhQv8rBNIaNQykPpTpoqJHUkxuL6QaCuG4H2lPfMSoPhA8jz91D3v6s4tVNUYrSxheBC47O58N8ox2sXkj1Iw-IhuZotA6pf9zyckDCh7Djt3XkpSWhktT0QF5cQ8Do8OT-Wgre-ASiy4H1n0kVz9fBnCOQ2eLW2Z39QXJ_pK-AT7Z2RSWsvga4QgU8JneG-c8BSKMW0FRk'
  },
  {
    id: 'saved-2',
    title: 'VP of Hardware Architecture',
    company: 'Humane Co',
    location: 'Remote, US',
    salary: '$240k - $310k',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJ6YsUeDwgfVq1LOm_Lsq-WnNlEjQbG0qC-h51ODeXjnpcsReBIxPtdtB74p7sEwbuQhQv8rBNIaNQykPpTpoqJHUkxuL6QaCuG4H2lPfMSoPhA8jz91D3v6s4tVNUYrSxheBC47O58N8ox2sXkj1Iw-IhuZotA6pf9zyckDCh7Djt3XkpSWhktT0QF5cQ8Do8OT-Wgre-ASiy4H1n0kVz9fBnCOQ2eLW2Z39QXJ_pK-AT7Z2RSWsvga4QgU8JneG-c8BSKMW0FRk'
  }
];

export const FOLLOW_UP_REMINDERS: FollowUpReminder[] = [
  {
    id: 'reminder-1',
    title: 'Marcus Wright',
    action: 'Interview Feedback',
    dueDate: 'DUE NOW',
    isUrgent: true
  },
  {
    id: 'reminder-2',
    title: 'Goldman Sachs',
    action: 'Update on Application',
    dueDate: 'TOMORROW'
  },
  {
    id: 'reminder-3',
    title: 'Jessica Miller',
    action: 'Referral Onboarding',
    dueDate: 'OCT 26'
  }
];

export const TRENDING_OPPORTUNITIES: TrendingOpportunity[] = [
  {
    id: 'trend-1',
    title: 'Product Director',
    company: 'Notion',
    location: 'Remote',
    salary: '$180k - $220k',
    type: 'NEWLY ADDED',
    logoLetter: 'N',
    logoBg: 'bg-black',
    isFavorite: false
  },
  {
    id: 'trend-2',
    title: 'Head of People',
    company: 'Stripe',
    location: 'Dublin',
    salary: '€160k - €200k',
    type: 'HIGH MATCH',
    logoLetter: 'S',
    logoBg: 'bg-emerald-800',
    isFavorite: false
  },
  {
    id: 'trend-3',
    title: 'Strategy Lead',
    company: 'Microsoft',
    location: 'Seattle',
    salary: '$190k - $240k',
    type: 'ACTIVE HIRING',
    logoLetter: 'M',
    logoBg: 'bg-red-600',
    isFavorite: false
  },
  {
    id: 'trend-4',
    title: 'Engineering VP',
    company: 'Airbnb',
    location: 'London',
    salary: '£180k - £220k',
    type: 'SAVED',
    logoLetter: 'A',
    logoBg: 'bg-stone-900',
    isFavorite: true
  },
  {
    id: 'trend-5',
    title: 'Legal Counsel',
    company: 'Google',
    location: 'Zurich',
    salary: 'CHF 220k',
    type: 'NEW',
    logoLetter: 'G',
    logoBg: 'bg-blue-600',
    isFavorite: false
  }
];

export const DISCOVERY_JOBS: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Senior Product Designer',
    company: 'Stellar Tech Systems',
    location: 'San Francisco',
    salaryMin: 160000,
    salaryMax: 210000,
    category: 'Design',
    remote: false,
    companySize: '51-200',
    aiMatchScore: 85,
    logoLetter: 'S',
    logoBg: 'bg-primary-container',
    description: 'Lead design cycles for enterprise collaboration platforms, designing user-oriented layouts driven by high-end typography and sleek modern interfaces.',
    isFavorite: false
  },
  {
    id: 'job-2',
    title: 'Data Engineering Lead',
    company: 'Lumina Global',
    location: 'Remote, Europe',
    salaryMin: 140000,
    salaryMax: 185000,
    category: 'Engineering',
    remote: true,
    companySize: '201-1k',
    aiMatchScore: 62,
    logoLetter: 'L',
    logoBg: 'bg-secondary',
    description: 'Build petabyte-scale streaming pipelines deploying Apache Flink and Kafka. Secure micro-border infrastructure and tune query capabilities.',
    isFavorite: false
  },
  {
    id: 'job-3',
    title: 'Product VP',
    company: 'Linear',
    location: 'San Francisco',
    salaryMin: 280000,
    salaryMax: 350000,
    category: 'Product',
    remote: false,
    companySize: '1-50',
    aiMatchScore: 94,
    logoLetter: 'L',
    logoBg: 'bg-neutral-900',
    description: 'Chart the long-term vision of issue tracking. Oversee a high-precision, visually crafted product that scales fluidly with engineering teams.',
    isFavorite: true
  },
  {
    id: 'job-4',
    title: 'VP of Product Engineering',
    company: 'Superbase',
    location: 'Remote, US',
    salaryMin: 220000,
    salaryMax: 270000,
    category: 'Engineering',
    remote: true,
    companySize: '1-50',
    aiMatchScore: 89,
    logoLetter: 'S',
    logoBg: 'bg-orange-600',
    description: 'Grow and direct developer-focused product engineering. Drive API reliability, fast package installation guidelines, and flawless state sync.',
    isFavorite: false
  },
  {
    id: 'job-5',
    title: 'Brand Marketing Director',
    company: 'Webflow',
    location: 'Remote, US',
    salaryMin: 150000,
    salaryMax: 195000,
    category: 'Marketing',
    remote: true,
    companySize: '201-1k',
    aiMatchScore: 78,
    logoLetter: 'W',
    logoBg: 'bg-blue-800',
    description: 'Evangelize the no-code design revolution. Coordinate massive multi-channel visual content campaigns geared towards luxury agency spaces.',
    isFavorite: false
  },
  {
    id: 'job-6',
    title: 'Strategic Finance Lead',
    company: 'Ramp',
    location: 'New York, US',
    salaryMin: 180000,
    salaryMax: 230000,
    category: 'Finance',
    remote: false,
    companySize: '201-1k',
    aiMatchScore: 81,
    logoLetter: 'R',
    logoBg: 'bg-amber-600',
    description: 'Steer corporate development and capital structure analytics. Conduct high-contrast budget projections evaluating transactional growth metrics.',
    isFavorite: false
  }
];

export const EMAIL_THREADS: EmailThread[] = [
  {
    id: 'thread-1',
    candidateName: 'Julianne Vane',
    subject: 'Re: Senior Product Design Lead Opportunity',
    status: 'Replied',
    time: '2:45 PM',
    preview: "Thank you for reaching out regarding the Senior Product Design...",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-AV5haeBWycRUlMfITw6U9fuh9307ghCtk3bpKWulYdDI3WZyGvnRxTdQSN45wqj8IG-ytjb7kh_2eOX8EHopWw8dFxG0MYWe4MaVGsI5zetnp85kIBh9O0lSBE9gyAimd4NDsBRYJO7nV553rVw8X0zAObr9u58kJi6MBISh-vqbt-dYlDIymeg6PVkTn8V5HsLLJnla4XW3WpaodaTjkWkJOgnteq-jCkrMyExavpxFFh1zQLKNyWN4iOyoElp7vpAZsihSxguJ',
    email: 'julianne.v@designstudio.com',
    tags: ['Replied', 'High Priority'],
    conversation: [
      {
        senderName: 'Alex Mercer',
        senderEmail: 'alex.mercer@elitehr.com',
        time: 'Yesterday, 4:12 PM',
        body: "Hi Julianne,\n\nI'm currently representing a Tier-1 Fintech client looking for a Senior Design Lead. Your recent work on the Unified Design System caught my eye. Are you open to a confidential conversation?",
        isUser: true
      },
      {
        senderName: 'Julianne Vane',
        senderEmail: 'julianne.v@designstudio.com',
        time: 'Today, 2:45 PM',
        body: "Dear Alex,\n\nThank you for reaching out regarding the Senior Product Design Lead Opportunity. I've been following the growth of your client's firm for some time, and the role sounds like a perfect alignment with my experience in scaling design systems for fintech.\n\nI have reviewed the preliminary compensation details and find them to be within my expected range. I'm very interested in learning more about the specific cultural initiatives the team is currently undertaking.\n\nWould you have 15 minutes to chat on Wednesday morning? I am generally free between 9:00 AM and 11:30 AM EST.\n\nBest regards,\nJulianne",
        isUser: false
      }
    ]
  },
  {
    id: 'thread-2',
    candidateName: 'Marcus Chen',
    subject: 'Regarding the CTO Search at Horizon Labs',
    status: 'Opened',
    time: '11:12 AM',
    preview: "I have finished the technical assessment. Please find the repository link...",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdAbNDYuASsa4kK6pKV6i80K9Htc2UaXMoYvA4wtIICfIdqUXIuPLF51RDJIVdVaeDSBqaD8N9W1m15TlPFT_2UL0GpsKwLp_qnyJVV5dMvwEspCJALxDsGTgO9m1BMvMyfSqX-HmxRTYoJthByiaELRKCsVuz8zVeMAtF_Xk0xwFEWQEUehrJnsQtAatLzFAsoOBAJu08VsEa6wrjUGD9lzmXEdRyinzq4wndp9GjFWor856uajVV-Ns7ZBcfPRBQNYIQZjnJZ-2J',
    email: 'marcus.chen@techinfrastructure.org',
    tags: ['Opened'],
    conversation: [
      {
        senderName: 'Alex Mercer',
        senderEmail: 'alex.mercer@elitehr.com',
        time: '2 days ago',
        body: 'Hello Marcus,\n\nFollowing up on our call, I’ve completed the internal referral profile for Horizon Labs. Could you send over the technical assessment repository link so I can push it to the board?',
        isUser: true
      },
      {
        senderName: 'Marcus Chen',
        senderEmail: 'marcus.chen@techinfrastructure.org',
        time: 'Today, 11:12 AM',
        body: "Hi Alex,\n\nI have finished the technical assessment. Please find the repository link attached. I am looking forward to the next steps of the interview.\n\nLet me know if there are any specific architectural highlights you'd like me to prep for the panel interview.\n\nBest,\nMarcus",
        isUser: false
      }
    ]
  },
  {
    id: 'thread-3',
    candidateName: 'Sarah Jenkins',
    subject: 'Follow up: Interview Availability',
    status: 'Sent',
    time: 'Yesterday',
    preview: "Checking in to see if the panel has had a chance to review your portfolio...",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8YZ6tw4clchNeSuzABrFRIjA46SbE74LoLAEZiLryV60Xbs_ANRxzQo3mmMoI91LRAHXO8RccxlwtEXcAUbqDMkDNmGOJbAFOZSDihHvoytRsa6QEYphD5z-QvCkU5cdTGfx8Tulu72wPcvuf51gsbn-Re0qUKs_fkswyTA7Ntxi69pcaXSNYmsap3n22IV8Hzs4yCuG3LQHllm4S4z84zmz-eV9FCnFxuybdU6AOMdxNxL9_PSfI_l50Mf6V47vm29PqUFj9Pknp',
    email: 'sarah.jenkins@lumina-analytics.com',
    tags: ['Sent', 'Follow-up'],
    conversation: [
      {
        senderName: 'Sarah Jenkins',
        senderEmail: 'sarah.jenkins@lumina-analytics.com',
        time: '3 days ago',
        body: "Hi Alex,\n\nI really enjoyed meeting the team yesterday. They had deep insights on global operations scaling.\n\nIs there any early feedback you can share? Also, here are my available time slots for the final technical rounds.",
        isUser: false
      },
      {
        senderName: 'Alex Mercer',
        senderEmail: 'alex.mercer@elitehr.com',
        time: 'Yesterday',
        body: "Hi Sarah,\n\nChecking in to see if the panel has had a chance to review your portfolio. I'm available all day Tuesday or Wednesday afternoon to discuss and will push for an immediate timeline.\n\nTalk soon,\nAlex",
        isUser: true
      }
    ]
  },
  {
    id: 'thread-4',
    candidateName: 'David Wright',
    subject: 'Executive Referral - Strategic Operations',
    status: 'Bounced',
    time: 'Jan 12',
    preview: "Mail delivery failed: returning message to sender...",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvIcyyQ4zMLQPWmHgBikZX2MjjKN5f5jCGmz7umLKQsEGNiT6PyVXsjzgmyrq8nZpTsxQKkAn1EPwXfVDEPuBQ0jrDdFNUHXFC1Cpt8Q4o5z5E8x-zfQ-CxXnBopVSqoZ2E2IP9GGaOClbfR3FvjRX4ZBZ6BP574kPBcmyHb0XawVPvMVUla_OXYRGf5yHYtL7vJyf5Kd8zELwry4-UD6THCDUWPta07knsLgoR7imqgqrlv7DjZCzzRygbX_ALNt-xfold6WPB5MO',
    email: 'david.wright@bounced-delivery.net',
    tags: ['Bounced'],
    conversation: [
      {
        senderName: 'Alex Mercer',
        senderEmail: 'alex.mercer@elitehr.com',
        time: 'Jan 12',
        body: 'Dear David,\n\nYour profile stood out during our search for a VP of Strategic Operations. We have a highly confidential headhunt running for a tier-1 company. Let me know if you are open to speaking.',
        isUser: true
      },
      {
        senderName: 'Mail Deliver System',
        senderEmail: 'postmaster@bounced-delivery.net',
        time: 'Jan 12',
        body: "Mail delivery failed: returning message to sender.\n\nThe recipient's email system is experiencing temporary issues or safety blocks. Please attempt resending at a later date.",
        isUser: false
      }
    ]
  }
];

export const REFERRAL_STATUSES: ReferralCandidate[] = [
  {
    id: 'ref-1',
    name: 'Julianne Moore',
    role: 'Senior Product Designer',
    department: 'Product',
    stage: 'referred',
    source: 'Direct Referral',
    statusText: 'Direct Referral'
  },
  {
    id: 'ref-2',
    name: 'Marcus Chen',
    role: 'Cloud Infrastructure Lead',
    department: 'Engineering',
    stage: 'referred',
    source: 'Shared Link',
    statusText: 'Shared Link'
  },
  {
    id: 'ref-3',
    name: 'Elena Rodriguez',
    role: 'VP of Operations',
    department: 'Finance',
    stage: 'screening',
    source: 'Direct Referral',
    statusText: 'HR Call Scheduled'
  },
  {
    id: 'ref-4',
    name: 'Thomas Wright',
    role: 'Creative Director',
    department: 'Design',
    stage: 'interviewing',
    source: 'Direct Referral',
    statusText: 'Final Round',
    isFinalRound: true
  },
  {
    id: 'ref-5',
    name: 'Sarah Connor',
    role: 'Lead Architect',
    department: 'Tech',
    stage: 'hired',
    source: 'Direct Referral',
    statusText: 'Closed - May 12',
    dateClosed: 'May 12'
  }
];

export const TOP_REFERRERS: TopReferrer[] = [
  {
    rank: 1,
    name: 'Anita Desai',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5dtmgbxQ00jST_hLd7RD7fiMaMZRfCyPtSdwvJAEUXcpc8YSsjzx-HvK8AVPKzEhwDVbMVd7fGv7mm3sXBup1un-MHt21GF0B3lgHBIlmLsHlxcPVDKySRAZ55i-1imGyciBvpo5ZDwlqXaBKS7wzCRAsziItWYvA9-ZTU7Qp3UlBtCfrjUmak-q9Gn6D_WFeNVxJfwLXArXXVCQ6Ps5EyQi0UdhNVHIILnDX-DD6VLChB7A4fAQA45XUdSdKaxktiFvgkYxthwCj',
    hires: 12,
    points: 8400,
    level: 'Gold'
  },
  {
    rank: 2,
    name: 'David Vance',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtUNttd3TMNRv7KqQkH_HR8nVwcvA4zT9As6oEPC0Izm-EQ_c6Bb5FdiQCZ1y6Jv-yrfq-m8kdYuZmSxaE8hYH-kvac-YjrgboeOvmyJkTUpDSzT7OKJFvZ_rKLDM6lj_ZPyhlfo5eaLa7_XpiRuyxyzJXJIeIqAGfx-xNBhoO7ZuwO2YfQHHqDkwn5D5QckZQ3zKX2jVgMo9yP2ESz4atIUrddii6Zrn0-wn9VIOCrkW5qCbdFeA7_5fDjRhN5aUjdDY708Q-oBw4',
    hires: 9,
    points: 6100,
    level: 'Gold'
  },
  {
    rank: 3,
    name: 'Claire Beaumont',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACuNDoZGmIi47NzYgbksvXxpDf7Ifdw8tBrafrLYJCwsBW4-PK6pnD4ikNnw5QbsfmdUt_OnzVeWDvrU0fzMWecC7ksJ3Ta7kZRPoNM7Gf4QdCekWHUFUc2DT4QvuyIw7vPev8AERYCXL1PQxxYiIMDak7vhXXJPgHOOwNhmJ-ne-k66Ps8t9agoODRbcXWPu1wmhYrlA29HZg1CKaBfaXclKNZPsJ1al3TpeGEI8gQ6jTYV2dxXsLFYDWpuNsCM2goE9rtnCf1jVQ',
    hires: 7,
    points: 4800,
    level: 'Silver'
  }
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'temp-1',
    name: 'Executive Headhunt',
    subject: 'Executive Leadership Opportunity | Discussion regarding {company}',
    category: 'Cold Outreach',
    variables: ['{first_name}', '{company}', '{position}'],
    body: "Dear {first_name},\n\nI have been closely following the impressive growth of {company} and your recent leadership in the expansion strategy. Your background in scaling high-performance teams is exactly the type of expertise we are currently seeking for an exclusive executive search on behalf of a Tier-1 Venture firm.\n\nThe role is a Confidential VP of Talent position for a Series C fintech disruptor. Given your trajectory, I would love to schedule a brief introductory call to discuss the landscape and see if this aligns with your next strategic career pivot.\n\nAre you available for a 15-minute conversation on Tuesday afternoon?\n\nWarmly,\n\n{sender_name}\nElite HR Global"
  },
  {
    id: 'temp-2',
    name: 'Series C Introduction',
    subject: 'Intro: Series C fintech disruptor VP of Growth',
    category: 'Cold Outreach',
    variables: ['{first_name}', '{company}', '{position}'],
    body: "Dear {first_name},\n\nOur portfolio company is looking for a VP of Growth with your specific experience. Having reviewed your success at {company}, your brand alignment stands out.\n\nLet me know if you would like to receive a brief brief outlining the details and confidential compensation details.\n\nWarmly,\n\n{sender_name}"
  },
  {
    id: 'temp-3',
    name: 'Standard Direct Reach',
    subject: 'Career opportunity | Chief Strategy Officer discussion',
    category: 'Cold Outreach',
    variables: ['{first_name}', '{position}'],
    body: "Hi {first_name},\n\nReaching out because your profile stood out during our search for a new {position}.\n\nIf you are open to evaluating confidential executive roles, let's schedule 10 minutes to sync.\n\nBest,\n\n{sender_name}"
  },
  {
    id: 'temp-4',
    name: 'Board Interview Sync',
    subject: 'Lumina Board round invitation - {first_name}',
    category: 'Follow-up',
    variables: ['{first_name}'],
    body: "Hi {first_name},\n\nI'm pleased to let you know that the Lumina board was thrilled with your executive presentation. They would like to schedule a final 45-minute virtual round this week.\n\nPlease share three slots that work best for you.\n\nBest,\n\n{sender_name}"
  }
];
