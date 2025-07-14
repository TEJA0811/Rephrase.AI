let num: number = 3;
let str: string = "abc";
let arrS: string[] = ["abc", "xyz"];
let arrN: number[] = [1,2,3];
let tuple: [string, number] = ["abc", 7];
let bool: boolean = true;
let object: {} = { "abc": 1, "xyz": 5 };
let objectWithNames: {n1: string, n2: number} = {n1: "teja",n2: 5};



type Role = "admin" | "user" | "guest";
type UserID = number | string
let loginRecord: [UserID, number];
let loginHistory: [number | string, number][];
interface User{
    id: UserID,
    name: string,
    role: Role,
    email?: string,
    readonly isActive: boolean
}
let useFilter = (x: User): boolean =>{}

//types
//functions
//interfaces
//enums
//re-writing tuples
//re-writing interfaces

