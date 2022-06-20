import {Router} from 'itty-router'
import { withParams } from 'itty-router-extras'
import { corsHelper } from './cors-helper'
import faunadb from 'faunadb'

const router = Router();
const q = faunadb.query;

const client = new faunadb.Client({
  secret: '',
});

router.options('*', corsHelper)

router.get('/', () => {
  return new Response("Hello GET!")
})

router.post('/', () => {
  return new Response("Hello POST!")
})

router.put('/', () => {
  return new Response("Hello PUT")
})

router.delete('/', () => {
  return new Response("Hello DELETE")
})

router.get('/todos', async () => {
  try {
    const data = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('todos'))),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    )
    return new Response(JSON.stringify(data, null, 2))
  } catch {
    return new Response("Error")
  }
})

router.get('/todos/:id', withParams, async ({params}) => {
  try {
    const id = params ? params.id : ''
    const data = await client.query(
      q.Get(q.Ref(q.Collection('todos'), id))
    )
    return new Response(JSON.stringify(data, null, 2))
  } catch {
    return new Response("Error")
  }
})

router.post('/todos', async () => {
  try {
    const createTodo = await client.query(
      q.Create(q.Collection('todos'), {data: {name: "Hello Fauna"}})
    )
    return new Response(JSON.stringify(createTodo, null, 2))
  } catch {
    return new Response("Error")
  }
})

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }))

// attach the router "handle" to the event handler
addEventListener('fetch', event =>
  event.respondWith(router.handle(event.request))
)