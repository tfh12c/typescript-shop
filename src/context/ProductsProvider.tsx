import { ReactElement, createContext, useState } from "react"

//define shape of single product
export type ProductType = {
    sku: string
    name: string
    price: number
}

//define init state
const initState: ProductType[] = [
    {
        "sku": "item0001",
        "name": "Widget",
        "price": 9.99
    },
    {
        "sku": "item0002",
        "name": "Premium Widget",
        "price": 19.99
    },
    {
        "sku": "item0003",
        "name": "Deluxe Widget",
        "price": 29.99
    }
]

//define shape of data that will be returned from context hook for product list
export type UseProductsContextType = { products: ProductType[] }

//define init state of context that will be used in provider component for product list context
const initContextState: UseProductsContextType = { products: [] }

//create new context for the product list
const ProductsContext = createContext<UseProductsContextType>(initContextState);

//define children type (needed in react18+)
type ChildrenType = { children?: ReactElement | ReactElement[] }

//create provider
export const ProductsProvider = ({ children }: ChildrenType): ReactElement => {
    const [products, setProducts] = useState<ProductType[]>(initState)

    return (
        <ProductsContext.Provider value = {{ products }}>
            {children}
        </ProductsContext.Provider>
    )
}

export default ProductsContext