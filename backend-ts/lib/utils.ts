import { v4 } from 'uuid';
import sanitizer, { sanitize } from 'sanitizer';

export function sanitize_menus(menus: {name: string, vegetarian: any}[]) {
    var sanitized_menus: { menus: { name: string, vegetarian: boolean, uuid: string}[] } = {
        menus: menus.map((e: {name: string, vegetarian: any}) => {
                return {
                    name: sanitizer.sanitize(e.name),
                    vegetarian: e.vegetarian != null ? e.vegetarian : false,
                    uuid: v4()
                }
        })
    };
    sanitized_menus.menus = sanitized_menus.menus.filter((e) => { return e.name != "" && e.name != null });
    return sanitized_menus
}

export function sanitize_menus_edit(menus: {name: string, vegetarian: any, uuid: string}[]) {
    var sanitized_menus: { menus: { name: string, vegetarian: boolean, uuid: string}[] } = {
        menus: menus.map((e: {name: string, vegetarian: any, uuid: string}) => {
                return {
                    name: sanitizer.sanitize(e.name),
                    vegetarian: e.vegetarian != null ? e.vegetarian : false,
                    uuid: e.uuid != null && e.uuid != "" ? sanitizer.sanitize(e.uuid) : v4()
                }
        })
    };
    sanitized_menus.menus = sanitized_menus.menus.filter((e) => { return e.name != "" && e.name != null });
    return sanitized_menus
}

export function sanitize_date(day: string) {
    return sanitizer.sanitize(day);
}