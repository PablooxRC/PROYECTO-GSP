import { forwardRef } from "react"
export const Textscout = forwardRef((props, ref)=>{
    return (
        <Textscout 
        type="text" className="bg-zinc-500 px-3 py-2 block my-2 w-full" 
        ref = {ref}
            {...props}
        >
            {props.children}
        </Textscout>
    );
})


export default Textscout