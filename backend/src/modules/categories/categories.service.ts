import { prisma } from '../../config/db';

export class CategoriesService {
  static async listCategories() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(name: string) {
    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      const error: any = new Error('Category with this name already exists.');
      error.statusCode = 409;
      throw error;
    }

    return await prisma.category.create({
      data: { name },
    });
  }

  static async updateCategory(id: string, name: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      const error: any = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    const existingName = await prisma.category.findUnique({
      where: { name },
    });

    if (existingName && existingName.id !== id) {
      const error: any = new Error('Category with this name already exists.');
      error.statusCode = 409;
      throw error;
    }

    return await prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  static async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!category) {
      const error: any = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    if (category._count.items > 0) {
      const error: any = new Error('Cannot delete category with associated items.');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.category.delete({
      where: { id },
    });
  }
}
