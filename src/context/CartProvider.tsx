import { useMemo, useReducer, createContext, ReactElement } from "react"


//define cart item
export type CartItemType = {
    sku: string
    name: string
    price: number
    qty: number
}

//define cart state type
type CartStateType = { cart: CartItemType[] }

//define init state
const initCartState: CartStateType = { cart: [] }

const REDUCER_ACTION_TYPE = {
    ADD: "ADD",
    REMOVE: "REMOTE",
    QUANTITY: "QUANTITY",
    SUBMIT: "SUBMIT",
}


export type ReducerActionType = typeof REDUCER_ACTION_TYPE

export type ReducerAction = {
    type: string,
    payload?: CartItemType,
}

const reducer = (state: CartStateType, action: ReducerAction): CartStateType => {
    switch (action.type) {
        case REDUCER_ACTION_TYPE.ADD: {
            if (!action.payload) {
                throw new Error('action.payload missing in ADD action')
            }
            //destructure what we need:
            const { sku, name, price } = action.payload

            //filter cart to avoid duplicates of the same item (if we add same item twice, there wont be two of them in cart, we just want quantity to go up)
            const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku)

            //check for item exists
            const itemExists: CartItemType | undefined = state.cart.find(item => item.sku === sku)

            //set qty for item. if item exists, we up the quantity by one, otherwise item does not currently exist and we increase qty by 1
            const qty: number = itemExists ? itemExists.qty + 1 : 1

            return { ...state, cart: [ ...filteredCart, { sku, name, price, qty }]}
        }
        case REDUCER_ACTION_TYPE.REMOVE: {
            if (!action.payload) {
                throw new Error('action.payload missing in REMOVE action')
            }
            const { sku } = action.payload

            const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku)

            return { ...state, cart: [ ...filteredCart] }
        }
        case REDUCER_ACTION_TYPE.QUANTITY: {
            if (!action.payload) {
                throw new Error('action.payload missing in QUANTITY action')
            }
            const { sku, qty } = action.payload
            
            const itemExists: CartItemType | undefined = state.cart.find(item => item.sku === sku )

            if (!itemExists) {
                throw new Error('Item must exist in order to update quantity')
            }

            const updatedItem: CartItemType = { ...itemExists, qty }

            const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku)

            return { ...state, cart: [ ...filteredCart, updatedItem ]}
        }
        case REDUCER_ACTION_TYPE.SUBMIT: {
            return { ...state, cart: [] }
        }
        default: 
        throw new Error('Unidentified reducer action type')
    }
}

const useCartContext = (initCartState: CartStateType) => {
    const [state, dispatch] = useReducer(reducer, initCartState)

    //define reducer actions, useMemo reduces the amount of re-renders
    const REDUCER_ACTIONS = useMemo(() => {
        return REDUCER_ACTION_TYPE
    }, [])

    const totalItems: number = state.cart.reduce((previousValue, cartItem) => {
        return previousValue + cartItem.qty
    }, 0)

    const totalPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format(
        state.cart.reduce((previousValue, cartItem) => {
            return previousValue + (cartItem.qty * cartItem.price)
        }, 0)
    )

    const cart = state.cart.sort((a,b) => {
        const itemA = Number(a.sku.slice(-4))
        const itemB = Number(b.sku.slice(-4))
        return itemA - itemB
    })

    return { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart }
}

export type UseCartContextType = ReturnType<typeof useCartContext>

//initial state being passed into context
const initCartContextState: UseCartContextType = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispatch: () => {},
    REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
    totalItems: 0,
    totalPrice: '',
    cart: [],
}

export const CartContext = createContext<UseCartContextType>(initCartContextState)

type ChildrenType = { children?: ReactElement | ReactElement[] }

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
    return (
        <CartContext.Provider value={useCartContext(initCartState)}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext