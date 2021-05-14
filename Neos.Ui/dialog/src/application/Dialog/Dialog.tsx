import * as React from 'react';
import {useKey} from 'react-use';
import * as ReactFinalForm from 'react-final-form';

import {Button} from '@neos-project/react-ui-components';

import {useGlobalRegistry} from '@sitegeist/inspectorgadget-neos-bridge';

import {useEditorState, useEditorTransactions} from '../../domain';
import {Modal, Layout, Form as StyledForm} from '../../presentation';

import {Field} from '../Field';

export const DialogContainer: React.FC = () => {
    const {isOpen} = useEditorState();

    if (isOpen) {
        return (<Dialog/>);
    }

    return null;
};

interface Editor {
    validator(values: any): Generator<{
        field: string
        message: string
        external?: boolean
    }>
    Form: React.ComponentType<{
        api: {
            Field: typeof Field
            Layout: typeof Layout
        }
    }>
}

export const Dialog: React.FC = () => {
    const {type, value} = useEditorState();
    const {dismiss, apply} = useEditorTransactions();
    const globalRegistry = useGlobalRegistry();
    const Editor: undefined | Editor = globalRegistry.get('@sitegeist/inspectorgadget/editors')?.get(type ?? '');

    useKey('Escape', dismiss);

    return (
        <Modal
            renderTitle={() => 'Edit Value Object'}
            renderBody={() => (
                <ReactFinalForm.Form
                    initialValues={value}
                    onSubmit={apply}
                    validate={values => {
                        const result: {[key: string]: any} = {};

                        if (Editor) {
                            for (const {field, message, external} of Editor.validator(values)) {
                                result[field] = {message, external};
                            }
                        }

                        return result;
                    }}
                >{({handleSubmit, valid, dirty}) => (
                    <StyledForm
                        renderBody={() => Editor ? (
                            <Editor.Form
                                api={{Field, Layout}}
                            />
                        ) : (
                            <>
                                Missing Editor for: "{type}"
                            </>
                        )}
                        renderActions={() => Editor ? (
                            <>
                                <Button type="button" onClick={dismiss}>
                                    Close
                                </Button>
                                <Button
                                    style="success"
                                    type="submit"
                                    disabled={!valid || !dirty}
                                >
                                    Apply
                                </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={dismiss}>
                                Close
                            </Button>
                        )}
                        onSubmit={handleSubmit}
                    />
                )}</ReactFinalForm.Form>
            )}
        />
    );
}