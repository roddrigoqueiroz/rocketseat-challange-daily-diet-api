import { app } from '../app'
import { afterAll, beforeEach, beforeAll, describe, expect, test } from 'vitest'
import supertest from 'supertest'
import { execSync } from 'node:child_process'

describe('meal routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('create a new meal', async () => {
    await supertest(app.server)
      .post('/meal')
      .send({
        name: 'test meal',
        description: 'new test meal',
        date: '2023-09-22T15:53:00',
        inDiet: true,
      })
      .expect(201)
  })

  test('list all meals', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    const listMeals = await supertest(app.server)
      .get('/meal')
      .set('Cookie', cookie)

    expect(listMeals.body).toEqual([
      expect.objectContaining({
        name: 'test meal 1',
        description: 'new test meal',
        inDiet: 1,
      }),
    ])

    expect(200)
  })

  test('list meal by id', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    const listMeals = await supertest(app.server)
      .get('/meal')
      .set('Cookie', cookie)

    const mealById = await supertest(app.server)
      .get(`/meal/${listMeals.body[0].id}`)
      .set('Cookie', cookie)

    expect(mealById.body).toEqual(
      expect.objectContaining({
        name: 'test meal 1',
        description: 'new test meal',
        inDiet: 1,
        id: listMeals.body[0].id,
      }),
    )

    expect(200)
  })

  test('get total of meals created', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    await supertest(app.server).post('/meal').set('Cookie', cookie).send({
      name: 'test meal 2',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })
    await supertest(app.server).post('/meal').set('Cookie', cookie).send({
      name: 'test meal 3',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })

    const totalMealsAmount = await supertest(app.server)
      .get('/meal/total')
      .set('Cookie', cookie)

    expect(totalMealsAmount.body).toEqual(
      expect.objectContaining({
        'total meals': 3,
      }),
    )
  })

  test('total number of meals in diet', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    await supertest(app.server).post('/meal').set('Cookie', cookie).send({
      name: 'test meal 2',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: false,
    })
    await supertest(app.server).post('/meal').set('Cookie', cookie).send({
      name: 'test meal 3',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })

    const totalMealsInDiet = await supertest(app.server)
      .get('/meal/total-in-diet?inDiet=true')
      .set('Cookie', cookie)

    expect(totalMealsInDiet.body).toEqual([
      expect.objectContaining({
        total: 2,
      }),
    ])
  })

  test('best meal sequence', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T11:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    await supertest(app.server).post('/meal').set('Cookie', cookie).send({
      name: 'test meal 2',
      description: 'new test meal',
      date: '2023-09-22T15:53:00',
      inDiet: true,
    })
    await supertest(app.server).post('/meal').set('Cookie', cookie).send({
      name: 'test meal 3',
      description: 'new test meal',
      date: '2023-09-22T20:53:00',
      inDiet: true,
    })

    const mealSequence = await supertest(app.server)
      .get('/meal/best-meal-sequence')
      .set('Cookie', cookie)

    expect(mealSequence.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test meal 1',
          description: 'new test meal',
        }),
        expect.objectContaining({
          name: 'test meal 2',
          description: 'new test meal',
        }),
        expect.objectContaining({
          name: 'test meal 3',
          description: 'new test meal',
        }),
      ]),
    )
  })

  test('delete a meal', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T11:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    const listMeals = await supertest(app.server)
      .get('/meal')
      .set('Cookie', cookie)

    await supertest(app.server)
      .delete(`/meal/${listMeals.body[0].id}`)
      .set('Cookie', cookie)
      .expect(204)
  })

  test('update already created meal', async () => {
    const response = await supertest(app.server).post('/meal').send({
      name: 'test meal 1',
      description: 'new test meal',
      date: '2023-09-22T11:53:00',
      inDiet: true,
    })

    const cookie = response.get('Set-Cookie')

    const listMeals = await supertest(app.server)
      .get('/meal')
      .set('Cookie', cookie)

    await supertest(app.server)
      .put(`/meal/${listMeals.body[0].id}`)
      .send({
        name: 'updated test meal',
        description: 'updated new test meal',
        date: '2023-09-29T23:53:00',
        inDiet: true,
      })
      .set('Cookie', cookie)
      .expect(200)
  })
})
