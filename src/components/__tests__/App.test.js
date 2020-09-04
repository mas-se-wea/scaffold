import '@testing-library/jest-dom/extend-expect'
import {
	render,
	screen,
	waitForDomChange,
	waitForElement
} from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import App from '../App'

/*** Setup ***/

const server = setupServer(
	rest.get('/api/todos', (req, res, ctx) => {
		return res(
			ctx.json([
				{ id: 1, title: 'Todo One' },
				{ id: 2, title: 'Todo Two' }
			])
		)
	}),
	rest.get('/api/users', (req, res, ctx) => {
		return res(
			ctx.json([
				{ id: 1, name: 'Tobi' },
				{ id: 2, name: 'Patrik' }
			])
		)
	})
)

beforeAll(() => server.listen())

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

/*** Tests ***/

test('renders title', async () => {
	render(<App />)

	await waitForDomChange()

	expect(screen.getByRole('heading')).toHaveTextContent('My Todos')
})

test('fetches and renders todos', async () => {
	render(<App />)

	const todoOneElement = await waitForElement(() =>
		screen.getByText(/Todo One/)
	)

	expect(todoOneElement).toBeTruthy()
	expect(screen.getByText(/Todo Two/)).toBeTruthy()
})

test('fetches and renders users', async () => {
	render(<App />)

	const button = screen.getByText(/Load Users/)
	button.click()

	const tobiElement = await waitForElement(() => screen.getByText(/Tobi/))

	expect(tobiElement).toBeTruthy()
	expect(screen.getByText(/Patrik/)).toBeTruthy()
})

test('handles todo API error', async () => {
	server.use(
		rest.get('/api/todos', (req, res, ctx) => {
			return res(ctx.status(500))
		})
	)

	render(<App />)

	const alertElement = await waitForElement(() => screen.getByRole('alert'))

	expect(alertElement).toHaveTextContent(/Server Error/)
})
