import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post('/', async (req, res) => {
  const { email, name } = req.body;
  const user = await prisma.user.create({
    data: { email, name },
  });
  res.json(user);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, name } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { email, name },
  });
  res.json(user);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { id: Number(id) },
  });
  res.status(204).send();
});

export default router;