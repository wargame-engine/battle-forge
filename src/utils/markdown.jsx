import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Link, Typography } from '@mui/material';
import React from 'react';

const sanitizeId = (id) => {
  return id.replace(/\s+/g, '');
}

export const MarkdownRenderer = (options = {}) => {
  return {
    p: ({ children }) => <Typography paragraph>{children}</Typography>,
    h1: (props) => {
      const { children } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
    return (
      <Typography id={id} variant="h1" gutterBottom>
        {children}
      </Typography>
    )},
    h2: (props) => {
      const { children } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
      return (
      <Typography id={id} variant="h2" gutterBottom>
        {children}
      </Typography>
    )},
    h3: (props) => {
      const { children } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
      return (
      <Typography id={id} variant="h3" gutterBottom>
        {children}
      </Typography>
    )},
    h4: (props) => {
      const { children } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
      return (
      <Typography id={id} variant="h4" gutterBottom>
        {children}
      </Typography>
    )},
    h5: (props) => {
      const { children } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
      return (
      <Typography id={id} variant="h5" gutterBottom>
        {children}
      </Typography>
    )},
    h6: (props) => {
      const { children } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
      return (
      <Typography id={id} variant="h6" gutterBottom>
        {children}
      </Typography>
    )},
    a: (props) => {
      const { children, href } = props;
      const id = sanitizeId(children[0] ?? '').toLowerCase() ?? undefined;
      if (href === "#") {
        return (
        <Button
          style={{ textTransform: 'none' }}
          onClick={(el) => {
            const offset = -150;
            const element = document.getElementById(id);
            const y = element?.getBoundingClientRect()?.top + window.pageYOffset + offset;
            window.scrollTo({ behavior: 'smooth', top: y })
          }}
        >{children}</Button>
      );
      } else {
        return <Link {...props}>{children}</Link>;
      }
    },
    img: ({ alt, src, title }) => (
      <Box
        sx={{
          backgroundColor: "background.paper",
          my: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card fullWidth>
          <CardContent style={{ padding: 0 }}>
            <CardActionArea onClick={() => window.open(src, "_blank")}>
              <CardMedia component="img" alt={alt} image={src} title={title}
                style={{ maxHeight: '600px' }} />
            </CardActionArea>
          </CardContent>
        </Card>
      </Box>
    ),
  };
};

export const MaterialRenderer = (options = {}) => {
  return {
    p: ({ children }) => (<Typography paragraph>{children}</Typography>),
    h1: ({ children }) => (<Typography variant="h1" gutterBottom>{children}</Typography>),
    h2: ({ children }) => (<Typography variant="h2" gutterBottom>{children}</Typography>),
    h3: ({ children }) => (<Typography variant="h3" gutterBottom>{children}</Typography>),
    h4: ({ children }) => (<Typography variant="h4" gutterBottom>{children}</Typography>),
    h5: ({ children }) => (<Typography variant="h5" gutterBottom>{children}</Typography>),
    h6: ({ children }) => (<Typography variant="h6" gutterBottom>{children}</Typography>),
    a: (props) => (<Link {...props}>{props.children}</Link>),
    img: ({
      alt,
      src,
      title,
    }) => (
      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '5px' }}>
        <a href={src} rel="noreferrer" target={"_blank"}>
          <CardMedia
            alt={alt}
            image={src}
            title={title}
            style={{ margin: '5px auto', maxWidth: '700px' }}
            className={"d-block width-100 rules-image"}
          />
        </a>
      </div>
    ),
  }
};