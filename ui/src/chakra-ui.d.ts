import '@chakra-ui/react';

declare module '@chakra-ui/react' {
  namespace Field {
    interface LabelProps {
      children?: React.ReactNode;
    }
  }

  namespace Popover {
    interface TriggerProps {
      children?: React.ReactNode;
    }

    interface ContentProps {
      children?: React.ReactNode;
    }

    interface HeaderProps {
      children?: React.ReactNode;
    }
  }

  namespace Tabs {
    interface ListProps {
      children?: React.ReactNode;
    }

    interface TriggerProps {
      children?: React.ReactNode;
    }
  }
}

