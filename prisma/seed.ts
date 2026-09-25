import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create sample events
  const events = [
    {
      title: 'Marathon Volunteer Crew',
      description: 'We need enthusiastic volunteers to help with the annual city marathon. Roles include water station attendants, route marshals, registration desk helpers, and finish line coordinators. No experience required - just bring your energy!',
      dateStart: new Date('2024-06-15T06:00:00Z'),
      dateEnd: new Date('2024-06-15T14:00:00Z'),
      reportingTime: '05:30',
      eventHours: '8 hours',
      location: 'City Center Park, Main Street',
      mapLink: 'https://maps.google.com/?q=City+Center+Park',
      role: 'Route Marshal / Water Station',
      payment: '₹500 + Lunch + Certificate',
      perks: 'Free lunch, event t-shirt, volunteer certificate, transport reimbursement',
      genderReq: 'Any',
      slotsNeeded: 20,
      contact: '9876543210',
      status: 'ACTIVE',
    },
    {
      title: 'Corporate Gala Reception',
      description: 'Elegant evening event requiring professional volunteers for guest registration, coat check, ushering, and VIP assistance. Business casual attire required.',
      dateStart: new Date('2024-06-20T17:00:00Z'),
      dateEnd: new Date('2024-06-20T23:00:00Z'),
      reportingTime: '16:00',
      eventHours: '6 hours',
      location: 'Grand Hotel, Ballroom A',
      mapLink: 'https://maps.google.com/?q=Grand+Hotel',
      role: 'Guest Registration / Ushering',
      payment: '₹800 + Dinner',
      perks: 'Free dinner, networking opportunities, event badge',
      genderReq: 'Any',
      slotsNeeded: 10,
      contact: '9876543211',
      status: 'ACTIVE',
    },
    {
      title: 'Tech Conference Support',
      description: 'Major tech conference needs volunteers for attendee check-in, session room monitoring, speaker assistance, and swag bag distribution. Great for students and tech enthusiasts!',
      dateStart: new Date('2024-07-10T08:00:00Z'),
      dateEnd: new Date('2024-07-11T18:00:00Z'),
      reportingTime: '07:30',
      eventHours: '10 hours/day',
      location: 'Convention Center, Downtown',
      mapLink: 'https://maps.google.com/?q=Convention+Center+Downtown',
      role: 'Check-in / Room Monitor / Speaker Assistant',
      payment: '₹600/day + Meals',
      perks: 'Free meals, conference access, swag bag, certificate',
      genderReq: 'Any',
      slotsNeeded: 30,
      contact: '9876543212',
      status: 'ACTIVE',
    },
    {
      title: 'Community Festival Cleanup',
      description: 'Post-festival cleanup crew needed. Help restore the park to its original condition. Gloves and bags provided. Perfect for groups!',
      dateStart: new Date('2024-07-15T09:00:00Z'),
      dateEnd: new Date('2024-07-15T13:00:00Z'),
      reportingTime: '08:30',
      eventHours: '4 hours',
      location: 'Riverside Park',
      mapLink: 'https://maps.google.com/?q=Riverside+Park',
      role: 'Cleanup Crew',
      payment: '₹300 + Snacks',
      perks: 'Snacks, water, community service hours certificate',
      genderReq: 'Any',
      slotsNeeded: 15,
      contact: '9876543213',
      status: 'DRAFT',
    },
    {
      title: 'Sports Tournament Officials',
      description: 'Regional basketball tournament needs scorekeepers, timekeepers, and court assistants. Basketball knowledge preferred but training provided.',
      dateStart: new Date('2024-08-05T08:00:00Z'),
      dateEnd: new Date('2024-08-07T20:00:00Z'),
      reportingTime: '07:30',
      eventHours: '12 hours/day',
      location: 'Sports Complex, Indoor Courts',
      mapLink: 'https://maps.google.com/?q=Sports+Complex',
      role: 'Scorekeeper / Timekeeper / Court Assistant',
      payment: '₹1000/day + Meals',
      perks: 'Meals, tournament merchandise, official certification',
      genderReq: 'Any',
      slotsNeeded: 12,
      contact: '9876543214',
      status: 'ACTIVE',
    },
  ];

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData,
    });
    console.log('✅ Created event:', event.title);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });