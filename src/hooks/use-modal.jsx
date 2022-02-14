import React, {
  memo, useCallback, useContext, useEffect, useMemo, useState
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

export function usePortal() {
  const portalElRef = React.useRef(document.createElement("div"));

  React.useEffect(() => {
    const theRef = portalElRef.current;
    document.body.appendChild(theRef);

    return () => {
      if (theRef) {
        document.body.removeChild();
      }
    };
  }, [portalElRef]);

  const Portal = React.useCallback(
    ({ children }) => {
      if (portalElRef.current != null)
        return createPortal(children, portalElRef.current);
      return null;
    },
    [portalElRef]
  );

  return Portal;
}

const Wrapper = styled.div`
  font-size: var(--sev1-size);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

/**
 * Throw error when ModalContext is used outside of context provider
 */
const invariantViolation = () => {
  throw new Error(
    "Attempted to call useModal outside of modal context. Make sure your app is rendered inside ModalProvider."
  );
};

/**
 * Modal Context Object
 */
export const ModalContext = React.createContext({
  showModal: invariantViolation,
  hideModal: invariantViolation,
});
ModalContext.displayName = "ModalContext";

/**
 * Modal Provider
 *
 * Provides modal context and renders ModalRoot.
 */
export const ModalProvider = ({ container, rootComponent, children }) => {
  if (container && !(container instanceof HTMLElement)) {
    throw new Error(`Container must specify DOM element to mount modal root into.
    This behavior has changed in 3.0.0. Please use \`rootComponent\` prop instead.
    See: https://github.com/mpontus/react-modal-hook/issues/18`);
  }
  const [modals, setModals] = useState({});
  const showModal = useCallback(
    (key, modal, extraProps) =>
      setModals((modals) => ({
        ...modals,
        [key]: { modal, extraProps },
      })),
    []
  );
  const hideModal = useCallback(
    (key) =>
      setModals((modals) => {
        if (!modals[key]) {
          return modals;
        }
        const newModals = { ...modals };
        delete newModals[key];
        return newModals;
      }),
    []
  );
  const contextValue = useMemo(() => ({ showModal, hideModal }), [hideModal, showModal]);

  return (
    <ModalContext.Provider value={contextValue}>
      <React.Fragment>
        {children}
        <ModalRoot
          modals={modals}
          component={rootComponent}
          container={container}
        />
      </React.Fragment>
    </ModalContext.Provider>
  );
};

/**
 * Component responsible for rendering the modal.
 *
 * The identity of `Component` may change dependeing on the inputs passed to
 * `useModal`. If we simply rendered `<Component />` then the modal would be
 * susceptible to rerenders whenever one of the inputs change.
 */
const ModalRenderer = memo((props) => {
  const { component, extraProps, ...rest } = props;
  return component({ extraProps, ...rest });
});

/**
 * Modal Root
 *
 * Renders modals using react portal.
 */
export const ModalRoot = memo(
  ({ modals, container, component: RootComponent = React.Fragment }) => {
    const [mountNode, setMountNode] = useState(undefined);
    // This effect will not be ran in the server environment
    useEffect(() => setMountNode(container || document.body), [container]);

    return mountNode
      ? createPortal(
        <RootComponent>
          {Object.keys(modals).map((key) => {
            return (
              <Wrapper>
                <ModalRenderer
                  key={key}
                  component={modals[key].modal}
                  extraProps={modals[key].extraProps}
                />
              </Wrapper>
            );
          })}
        </RootComponent>,
        mountNode
      )
      : null;
  }
);

/**
 * Utility function to generate unique number per component instance
 */
const generateModalKey = (() => {
  let count = 0;

  return () => `${++count}`;
})();

/**
 * Check whether the argument is a stateless component.
 *
 * We take advantage of the stateless nature of functional components to be
 * inline the rendering of the modal component as part of another immutable
 * component.
 *
 * This is necessary for allowing the modal to update based on the inputs passed
 * as the second argument to useModal without unmounting the previous version of
 * the modal component.
 */
const isFunctionalComponent = (Component) => {
  const prototype = Component.prototype;

  return !prototype || !prototype.isReactComponent;
};

/**
 * React hook for showing modal windows
 */
export const useModal = (component, inputs = []) => {
  if (!isFunctionalComponent(component)) {
    throw new Error(
      "Only stateless components can be used as an argument to useModal. You have probably passed a class component where a function was expected."
    );
  }

  const key = useMemo(generateModalKey, []);
  const modal = useMemo(() => component, [component]);
  const context = useContext(ModalContext);
  const [extraProps, setExtraProps] = useState({});
  const [isShown, setShown] = useState(false);
  const showModal = useCallback((extraProps) => {
    setShown(true)
    return setExtraProps(extraProps);
  }, []);
  const hideModal = useCallback(() => setShown(false), []);

  useEffect(() => {
    if (isShown) {
      context.showModal(key, modal, extraProps);
    } else {
      context.hideModal(key);
    }

    // Hide modal when parent component unmounts
    return () => context.hideModal(key);
  }, [modal, isShown, context, key, extraProps]);

  return [showModal, hideModal];
};