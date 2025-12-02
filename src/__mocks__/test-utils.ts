import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Mock PrismaService
export const mockPrismaService = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userProfile: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  orders: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  products: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  services: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  booking: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cart: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  memorial: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  church: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  flower: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  subscription: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

// Mock JwtService
export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
  decode: jest.fn(),
  signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
  verifyAsync: jest
    .fn()
    .mockResolvedValue({ sub: 'user-id', email: 'test@test.com' }),
};

// Mock ConfigService
export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      'stripe.secret_key': 'sk_test_mock_key',
      'stripe.webhook_secret': 'whsec_mock_secret',
      'jwt.secret': 'mock-jwt-secret',
      'database.url': 'mock-database-url',
      'aws.access_key_id': 'mock-access-key',
      'aws.secret_access_key': 'mock-secret-key',
      'aws.region': 'us-east-1',
      'aws.s3_bucket': 'mock-bucket',
    };
    return config[key] || 'mock-value';
  }),
};

// Mock UserService
export const mockUserService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn().mockResolvedValue([]),
};

// Mock OrdersService
export const mockOrdersService = {
  create: jest.fn(),
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock WebhookService
export const mockWebhookService = {
  handleWebhook: jest.fn(),
  processEvent: jest.fn(),
};

// Mock AuthService
export const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  validateUser: jest.fn(),
  generateToken: jest.fn().mockReturnValue('mock-token'),
};

// Mock Stripe Client
export const mockStripeClient = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_mock_session_id',
        url: 'https://checkout.stripe.com/pay/mock_session',
      }),
      retrieve: jest.fn(),
    },
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
  },
};

export { JwtService, ConfigService };
