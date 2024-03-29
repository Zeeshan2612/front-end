import React, {useEffect, useReducer} from "react";
import './Input.css';

import {validate} from '../../utils/validators';


const inputReducer = (state, action) => {
    //perform action logic
    switch(action.type){
        case 'CHANGE':
            return {
                ...state,
                value: action.val,
                isValid: validate(action.val, action.validators)
            };
        case 'TOUCH':
            return{
                ...state,
                isTouched: true
            };
        default:
            return state;
    }
}; 

const Input = props => {
    const  [inputState, dispatch] = useReducer(inputReducer, 
        {value: props.initialValue || '', 
        isValid: props.initialValid || false, 
        isTouched:false
    });

    const {id, onInput} = props;
    const { value, isValid} = inputState;
    // const value  = inputState.value;
    // const isValid = inputState.isValid;

    useEffect( () => {
        onInput(id, value, isValid)

    }, [id, value, isValid, onInput]);
    
    const changeHandler = event => {
        dispatch({
            type: 'CHANGE',
            val: event.target.value, 
            validators: props.validators
        });
    };

    const touchHandler = () => {
        dispatch({
            type: 'TOUCH'
        })
    };

    const element = props.element === 'input' ? 
    <input 
    id={props.id}
    type={props.type}
    placeholder={props.placeholder}
    onChange={changeHandler}
    onBlur={touchHandler}
    value={inputState.value}
    /> : 
    <textarea 
    id={props.id}
    placeholder={props.placeholder}
    rows={props.rows || 3}
    onChange={changeHandler}
    onBlur={touchHandler}
    value={inputState.value}
    />;

    return (
        <div className={`form-control ${!inputState.isValid && inputState.isTouched && 'form-control--invalid'}`}>
            <label htmlFor={props.id}>{props.label}</label>
            {element}
            {`'Valid: ' ${inputState.isValid} `}
            {`'isTouched: ' ${inputState.isTouched}`}
            {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
        </div>
    );
}

export default Input;