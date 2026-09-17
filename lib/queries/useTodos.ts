import {useQuery} from '@tanstack/react-query'

async function fetchTodos() {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
    if (!res.ok) throw new Error('Failed to fetch todos')
    return res.json()
}

export function useTodos() {
    return useQuery({
        queryKey: ['todos'],
        queryFn: fetchTodos,
    })
}