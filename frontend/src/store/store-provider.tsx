"use client"
import { ReactNode } from 'react'
import { store } from './store'
import { Provider } from 'react-redux'

export const StoreProvider = ({children}: {children: ReactNode})=>(
    <Provider store={store}>
        {children}
    </Provider>
)