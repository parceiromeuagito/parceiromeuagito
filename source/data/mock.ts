import { faker } from '@faker-js/faker';
import { Order, BusinessType, OrderStatus, Message, CatalogItem } from '../types';

const STATUSES: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

const generateMessages = (count: number): Message[] => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    sender: (Math.random() > 0.5 ? 'customer' : 'business') as 'customer' | 'business',
    content: faker.lorem.sentence(),
    timestamp: faker.date.recent(),
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Gera pedidos baseados em uma lista de tipos ativos
export const generateOrders = (count: number, activeTypes: BusinessType[]): Order[] => {
  return Array.from({ length: count }).map(() => {
    // Escolhe aleatoriamente um dos tipos ativos
    const type = faker.helpers.arrayElement(activeTypes);
    let specificData: Partial<Order> = {};

    if (type === 'hotel') {
      const checkIn = faker.date.soon();
      specificData = {
        checkIn,
        checkOut: new Date(checkIn.getTime() + 86400000 * faker.number.int({ min: 1, max: 7 })),
        items: [{ id: '1', name: 'Suíte Master Ocean View', quantity: 1, price: 850 }]
      };
    } else if (type === 'reservation') {
      specificData = {
        schedulingDate: faker.date.soon(),
        guests: faker.number.int({ min: 2, max: 8 }),
        items: [{ id: '1', name: 'Reserva Jantar', quantity: 1, price: 0 }]
      };
    } else if (type === 'tickets') {
      specificData = {
        items: [{ id: '1', name: 'Front Stage - Festival de Verão', quantity: 2, price: 250 }],
        seatNumber: `VIP-${faker.number.int({ min: 1, max: 100 })}`
      };
    } else {
      specificData = {
        items: [{ id: '1', name: faker.commerce.productName(), quantity: 1, price: parseFloat(faker.commerce.price()) }]
      };
    }

    return {
      id: `#${faker.number.int({ min: 10000, max: 99999 })}`,
      customerName: faker.person.fullName(),
      customerContact: faker.phone.number(),
      customerAvatar: faker.image.avatar(),
      type,
      total: specificData.items?.reduce((acc, i) => acc + (i.price * i.quantity), 0) || 0,
      status: faker.helpers.arrayElement(STATUSES),
      createdAt: faker.date.recent({ days: 2 }),
      paymentMethod: 'credit_card',
      chatHistory: generateMessages(faker.number.int({ min: 0, max: 5 })),
      ...specificData,
    } as Order;
  });
};

export const getMockOrders = (types: BusinessType[]) => generateOrders(12, types);

// Mock de Catálogo Dinâmico Combinado
export const getMockCatalog = (types: BusinessType[]): CatalogItem[] => {
  let allItems: CatalogItem[] = [];

  types.forEach(type => {
    const typeItems = Array.from({ length: 4 }).map(() => {
      if (type === 'hotel') {
        return {
          id: faker.string.uuid(),
          name: faker.helpers.arrayElement(['Suíte Master', 'Quarto Standard', 'Bangalô Luxo', 'Quarto Família']),
          description: 'Acomodação completa com vista para o mar, café da manhã incluso e wi-fi de alta velocidade.',
          price: parseFloat(faker.commerce.price({ min: 200, max: 1500 })),
          image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800',
          category: 'Acomodações',
          available: faker.datatype.boolean(),
          capacity: faker.number.int({ min: 2, max: 5 }),
          type
        };
      }
      if (type === 'tickets') {
        return {
          id: faker.string.uuid(),
          name: faker.helpers.arrayElement(['Pista Premium', 'Camarote Open Bar', 'Arquibancada', 'Backstage']),
          description: 'Acesso exclusivo com benefícios especiais para o evento principal.',
          price: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
          image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
          category: 'Lotes',
          available: true,
          stock: faker.number.int({ min: 0, max: 100 }),
          type
        };
      }
      if (type === 'scheduling') {
        return {
          id: faker.string.uuid(),
          name: faker.helpers.arrayElement(['Consulta Padrão', 'Manutenção', 'Aula Experimental', 'Sessão Completa']),
          description: 'Serviço especializado com profissional qualificado.',
          price: parseFloat(faker.commerce.price({ min: 80, max: 300 })),
          image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800',
          category: 'Serviços',
          available: true,
          duration: 60,
          type
        };
      }
      // Default (Delivery/Ecommerce/Reservation)
      return {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        image: faker.image.urlLoremFlickr({ category: 'food' }),
        category: faker.commerce.department(),
        available: faker.datatype.boolean(),
        type
      };
    });
    allItems = [...allItems, ...typeItems];
  });

  return allItems;
};

export const regenerateMockData = () => {
  localStorage.removeItem('businessOrders');
  localStorage.removeItem('businessCatalog');
  localStorage.removeItem('businessCustomers');
  window.location.reload();
};
