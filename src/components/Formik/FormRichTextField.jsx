import React, { useEffect, useCallback, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { MenuButtonBold, MenuButtonItalic, MenuControlsContainer, MenuDivider, MenuSelectHeading, RichTextEditor } from 'mui-tiptap';
import { get } from 'lodash-es';
import { Box, FormHelperText, FormLabel } from '@mui/material';
import unidecode from 'unidecode';

const FormRichTextField = ({
  formik,
  name,
  label,
  disabled,
  extensions = [],
  renderControls = [],
  onUpdate,
  updateContentOnChange = true,
  children,
  decodeInput = false,
  ...otherProps
}) => {
  const content = get(formik.values, name);
  const errors = get(formik.errors, name);
  const touched = get(formik.touched, name);
  const { setFieldValue, handleBlur } = formik;
  const rteRef = useRef(null);
  const rteEditor = rteRef?.current?.editor;

  const handleUpdate = ({ editor }) => {
    setFieldValue(name, decodeInput ? unidecode(editor.getHTML()) : editor.getHTML());
    if (onUpdate) {
      onUpdate(editor);
    }
  }

  useEffect(() => {
    if (updateContentOnChange) {
      if (!rteEditor || rteEditor.isDestroyed) {
        return;
      }
      if (!rteEditor.isFocused || !rteEditor.isEditable) {
        queueMicrotask(() => {
          const currentSelection = rteEditor.state.selection;
          rteEditor.chain().setContent(content).setTextSelection(currentSelection).run();
        });
      }
    }
  }, [content, updateContentOnChange, rteEditor, rteEditor?.isEditable, rteEditor?.isFocused]);

  const handleLocalBlur = useCallback((event) => {
    handleBlur({ target: { name } })
  }, [name, handleBlur]);

  return (
    <Box>
      <FormLabel>{label}</FormLabel>
      <RichTextEditor
        ref={rteRef}
        extensions={[StarterKit, ...extensions]}
        content={content}
        onUpdate={handleUpdate}
        onBlur={handleLocalBlur}
        editable={!disabled}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            {renderControls}
          </MenuControlsContainer>
        )}
      >
        {children}
      </RichTextEditor>
      <FormHelperText
        error={Boolean(touched) && Boolean(errors)}
      >
        {(errors) || ' '}
      </FormHelperText>
    </Box>
  );

};

export default FormRichTextField;