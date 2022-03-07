import React from 'react';
import { useState, useEffect } from 'react';
import MenuInput from './MenuInput';

export default function MenuDialog(props) {
	const [menus, setMenus] = useState([]);

    useEffect(() => {
        setMenus(props.menus)
    }, [props.menus]);

    function addMenu() {
        setMenus([...menus, {name: "", vegetarian: false}]);
    };

    function changeMenu(index, menu) {
        // Changing menus is very complicated because of react :(
        let items = [...menus];
        let item = {...menus[index]};
        item.name = menu.name;
        item.vegetarian = menu.vegetarian;
        item.uuid = menus[index].uuid;
        items[index] = item;
        setMenus(items);
        props.changeMenus(items)
    };

    return (
        <div className='justify-center items-center flex flex-col'>
            <div className='m-4 w-full'>
                {menus.map((e, i) => {
                    return (
                        <div key={i} id={i} className=''>
                            <MenuInput key={i} index={i} changeMenu={changeMenu} name={e.name} vegetarian={e.vegetarian} />
                        </div>
                    )
                })}
                <div className='text-center text-red-400'>
                    (Menus with an empty name won&apos;t be saved!)
                </div>
            </div>
            <div onClick={addMenu} className='w-1/4 flex flex-row items-center justify-center m-4 cursor-pointer p-2 px-5 rounded-md text-black bg-gray-200 hover:bg-gray-300'>
                Add Menu
            </div>
        </div>
    );
}
