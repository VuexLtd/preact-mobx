import { h, Component, ComponentLifecycle } from 'preact';
import { Reaction, observable, action, useStrict } from 'mobx';

export type Ctor<T> = {
    prototype: T;
    new(): T;
}

function augment<T, K extends keyof T>(object: T, key: K, func: T[K]) {
    const origMethod = object[key];
    object[key] = function () {
        (func as any).apply(this, arguments);
        if (origMethod) {
            (origMethod as any).apply(this, arguments);
        }
    } as any;
}

const mobxReaction = Symbol('mobxReaction');

export function observer(componentClass: Ctor<ComponentLifecycle<any, any> & Component<any, any>>) {
    augment(componentClass.prototype, 'componentWillMount', function(this: Component<any, any>) {
        const compName = (this.constructor as typeof Component).displayName || this.constructor.name;
        this[mobxReaction] = new Reaction(`${compName}.render()`, () => this.forceUpdate());
    });

    augment(componentClass.prototype, 'componentWillUnmount', function (this: Component<any, any>) {
        this[mobxReaction].dispose();
        this[mobxReaction] = null;
    })

    const origRender = componentClass.prototype.render;
    componentClass.prototype.render = function (this: Component<any, any>): any {
        const args = arguments;

        let renderResult: any;
        this[mobxReaction].track(() => {
            renderResult = origRender.apply(this, args);
        });

        return renderResult;
    }
}