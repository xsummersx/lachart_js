
import { defineStore} from 'pinia'
export const useStore = defineStore("main",{
    state:()=>{
        return {
            name:'back',
            cont:1
        }
    },
    getters:{
        doubleCont(state){
            return state.cont * 2
        }
    },
    actions:{
        changState(value){
            this.name = value
        }
    }
})