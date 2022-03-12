import { NextFunction, Request, Response } from 'express';
import { sanitize_menus, sanitize_menus_edit } from '../lib/utils';

describe('Test menu sanitization', () => {
    test('Test sanitize_menus with menu without vegetarian', async () => {
        const menus = [{name: "ab", vegetarian: undefined}];
        expect(sanitize_menus(menus).menus[0].vegetarian).toBe(false);
    });

    test('Test sanitize_menus with menu without name', async () => {
        const menus = [{name: "", vegetarian: undefined}, {name: "ab", vegetarian: true}];
        expect(sanitize_menus(menus).menus.length).toBe(1);
    });

    test('Test sanitize_menus_edit with no uuid', async () => {
        const menus = [{name: "asdfsdf", vegetarian: true, uuid: "adsfsdf"}, {name: "ab", vegetarian: true, uuid: ""}];
        var sanitized = sanitize_menus(menus);
        expect(sanitized.menus[0].uuid.length).toBe(36);
        expect(sanitized.menus[1].uuid.length).toBe(36);
    });

    test('Test sanitize_menus_edit with dirty name', async () => {
        const menus = [{name: "asdfsdfas<script>alert('hello')</script>", vegetarian: true, uuid: "adsfsdf"}];
        const menus_expected = {menus: [{name: "asdfsdfas", vegetarian: true, uuid: "adsfsdf"}]};
        expect(JSON.stringify(sanitize_menus_edit(menus))).toBe(JSON.stringify(menus_expected));
    });

    test('Test sanitize_menus_edit with dirty uuid', async () => {
        const menus = [{name: "asdfsdfas", vegetarian: true, uuid: "adsfsdf<script>alert('hello')</script>"}];
        const menus_expected = {menus: [{name: "asdfsdfas", vegetarian: true, uuid: "adsfsdf"}]};
        expect(JSON.stringify(sanitize_menus_edit(menus))).toBe(JSON.stringify(menus_expected));
    });
});