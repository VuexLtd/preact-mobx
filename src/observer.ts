import { Component } from 'preact';
import { Reaction } from 'mobx';

export type Ctor<T> = {
    prototype: T;
    new (): T;
};

function augment(object: object, key: string, func: Function) {
    const origMethod = object[key];
    object[key] = function() {
        (func as any).apply(this, arguments);
        if (origMethod) {
            return (origMethod as any).apply(this, arguments);
        }
    } as any;
}

const mobxReaction = Symbol('mobxReaction');

export function observer<T extends Component<any, any>>(
    componentClass: Ctor<T>,
) {
    augment(componentClass.prototype, 'componentWillMount', function(this: T) {
        const compName =
            (this.constructor as typeof Component).displayName ||
            this.constructor.name;
        this[mobxReaction] = new Reaction(`${compName}.render()`, () =>
            this.forceUpdate(),
        );
    });

    augment(componentClass.prototype, 'componentWillUnmount', function(
        this: T,
    ) {
        this[mobxReaction].dispose();
        this[mobxReaction] = null;
    });

    const origRender = componentClass.prototype.render;
    componentClass.prototype.render = function(this: T): any {
        const args = arguments;

        let renderResult: any;
        this[mobxReaction].track(() => {
            renderResult = origRender.apply(this, args);
        });

        return renderResult;
    };
}
